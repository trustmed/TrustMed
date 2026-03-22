import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createClerkClient, type ClerkClient } from '@clerk/backend';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../entities/auth-user.entity';
import { Person } from '../entities/person.entity';
import type { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly clerkClient: ClerkClient;

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(AuthUser)
    private readonly authUserRepository: Repository<AuthUser>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new InternalServerErrorException('CLERK_SECRET_KEY is not set');
    }
    this.clerkClient = createClerkClient({ secretKey });
  }

  /**
   * Verified login:
   * 1. Resolves Clerk user by email
   * 2. Verifies password via Clerk
   * 3. Checks if user is registered in our local DB and active
   * 4. Issues backend JWT
   */
  async login(email: string, password: string): Promise<string> {
    // 1. Find user by email
    const { data: users } = await this.clerkClient.users.getUserList({
      emailAddress: [email],
      limit: 1,
    });

    if (!users || users.length === 0) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = users[0];

    const registeredUser = await this.authUserRepository.findOne({
      where: { clerkUserId: user.id },
    });

    if (!registeredUser) {
      throw new UnauthorizedException(
        'User is not registered through this system',
      );
    }

    if (!registeredUser.active) {
      throw new UnauthorizedException('User account is inactive');
    }

    // 2. Verify password via Clerk
    try {
      const result = await this.clerkClient.users.verifyPassword({
        userId: user.id,
        password,
      });
      if (!result.verified) {
        throw new UnauthorizedException('Invalid email or password');
      }
    } catch (err: unknown) {
      const isClerkError =
        err !== null &&
        typeof err === 'object' &&
        'status' in err &&
        (err as { status: number }).status === 422;

      if (isClerkError) {
        throw new UnauthorizedException('Invalid email or password');
      }
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('Authentication failed');
    }

    // 3. Issue backend JWT with AuthUser details
    return this.signJwt({
      sub: registeredUser.clerkUserId,
      email: registeredUser.email,
      firstName: registeredUser.firstName,
      lastName: registeredUser.lastName,
      isDemoDisabled: registeredUser.isDemoDisabled,
      active: registeredUser.active,
      id: registeredUser.id,
    });
  }

  /**
   * Atomic registration:
   * 1. Creates user in Clerk
   * 2. Persists to local auth_users table
   * 3. Creates linked Person record
   * 4. Cleans up Clerk user if DB steps fail
   */
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName?: string,
  ): Promise<string> {
    let clerkUserId: string | undefined;

    try {
      const user = await this.clerkClient.users.createUser({
        emailAddress: [email],
        password,
        firstName,
        lastName,
      });

      clerkUserId = user.id;

      // 2. Save to auth_users table
      const authUserEntity = this.authUserRepository.create({
        clerkUserId: user.id,
        email,
        firstName: user.firstName ?? firstName,
        lastName: user.lastName ?? lastName ?? undefined,
        active: true,
      });

      const savedAuthUser = await this.authUserRepository.save(authUserEntity);

      // 3. Create linked Person record
      await this.personRepository.save(
        this.personRepository.create({
          email,
          authUserId: savedAuthUser.id,
        }),
      );

      // 4. Issue backend JWT with AuthUser details
      return this.signJwt({
        sub: savedAuthUser.clerkUserId,
        email: savedAuthUser.email,
        firstName: savedAuthUser.firstName,
        lastName: savedAuthUser.lastName,
        isDemoDisabled: savedAuthUser.isDemoDisabled,
        active: savedAuthUser.active,
        id: savedAuthUser.id,
      });
    } catch (err: unknown) {
      // Cleanup Clerk if DB persistence failed
      if (clerkUserId) {
        try {
          await this.clerkClient.users.deleteUser(clerkUserId);
        } catch (cleanupErr) {
          void cleanupErr;
        }
      }

      const isClerkError =
        err !== null &&
        typeof err === 'object' &&
        'errors' in err &&
        Array.isArray((err as { errors: { code: string }[] }).errors);

      if (isClerkError) {
        const errors = (err as { errors: { code: string; message: string }[] })
          .errors;
        const firstError = errors[0];
        if (firstError?.code === 'form_identifier_exists') {
          throw new BadRequestException(
            'An account with this email already exists',
          );
        }
        throw new BadRequestException(
          firstError?.message ?? 'Registration failed',
        );
      }

      throw new InternalServerErrorException('Registration failed');
    }
  }

  /**
   * Returns current user identity resolved from JWT payload.
   * Auto-syncs with Clerk if local record is missing.
   */
  async getMe(payload: JwtPayload) {
    const clerkUserId = (payload.sub || payload.id) as string;
    if (!clerkUserId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    let authUser = await this.authUserRepository.findOne({
      where: { clerkUserId },
    });

    if (!authUser) {
      try {
        const clerkUser = await this.clerkClient.users.getUser(clerkUserId);
        const email = clerkUser?.emailAddresses?.[0]?.emailAddress || '';
        const newAuthUser = this.authUserRepository.create({
          clerkUserId,
          email,
          firstName: clerkUser?.firstName ?? undefined,
          lastName: clerkUser?.lastName ?? undefined,
          active: true,
        });
        authUser = await this.authUserRepository.save(newAuthUser);
      } catch {
        throw new NotFoundException('User not found');
      }
    }

    if (!authUser) {
      throw new NotFoundException('User could not be resolved');
    }

    let person = await this.personRepository.findOne({
      where: { authUserId: authUser.id },
    });

    if (!person) {
      person = await this.personRepository.save(
        this.personRepository.create({
          authUserId: authUser.id,
          email: authUser.email,
        }),
      );
    }

    return {
      sub: authUser.clerkUserId,
      email: authUser.email,
      firstName: authUser.firstName,
      lastName: authUser.lastName,
      id: authUser.id, // Internal UUID from BaseEntity
      personId: person.id,
    };
  }

  private signJwt(payload: Record<string, unknown>): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
