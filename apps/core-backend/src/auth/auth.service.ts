import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createClerkClient, type ClerkClient } from '@clerk/backend';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../entities/auth-user.entity';

@Injectable()
export class AuthService {
  private readonly clerkClient: ClerkClient;

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(AuthUser)
    private readonly authUserRepository: Repository<AuthUser>,
  ) {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new InternalServerErrorException('CLERK_SECRET_KEY is not set');
    }
    this.clerkClient = createClerkClient({ secretKey });
  }

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
      // Re-throw UnauthorizedException from above
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('Authentication failed');
    }

    // 3. Issue backend JWT
    const primaryEmail = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    );
    return this.signJwt({
      sub: user.id,
      email: primaryEmail?.emailAddress ?? email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName?: string,
  ): Promise<string> {
    // 1. Create user in Clerk
    let clerkUserId: string | undefined;

    try {
      const user = await this.clerkClient.users.createUser({
        emailAddress: [email],
        password,
        firstName,
        lastName,
      });

      clerkUserId = user.id;

      await this.authUserRepository.save(
        this.authUserRepository.create({
          clerkUserId: user.id,
          email,
          firstName: user.firstName ?? firstName,
          lastName: user.lastName ?? lastName ?? null,
          isDemoDisabled: false,
          active: true,
        }),
      );

      // 2. Issue backend JWT
      return this.signJwt({
        sub: user.id,
        email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (err: unknown) {
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

      const isUniqueConstraintViolation =
        err !== null &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === '23505';

      if (isUniqueConstraintViolation) {
        if (clerkUserId) {
          try {
            await this.clerkClient.users.deleteUser(clerkUserId);
          } catch (cleanupError: unknown) {
            void cleanupError;
          }
        }

        throw new BadRequestException(
          'An account with this email is already registered in this system',
        );
      }

      throw new InternalServerErrorException('Registration failed');
    }
  }

  private async signJwt(payload: Record<string, unknown>): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
