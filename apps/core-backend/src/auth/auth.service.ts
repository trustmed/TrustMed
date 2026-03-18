import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './register-dto';
import { LoginDto } from './login-dto';
import { createClerkClient, type ClerkClient } from '@clerk/backend';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../entities/auth-user.entity';
import { Person } from '../entities/person.entity';

@Injectable()
export class AuthService {
  private clerkClient: ClerkClient;

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(AuthUser)
    private readonly authUserRepository: Repository<AuthUser>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY environment variable is not set');
    }
    this.clerkClient = createClerkClient({ secretKey });
  }

  private signJwt(payload: any): string {
    return this.jwtService.sign(payload);
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<{ message: string; token: string }> {
    const { email, password, name } = registerDto;

    // 1. Create or fetch Clerk user
    let clerkUser: any;
    let isExistingUser = false;

    try {
      clerkUser = await this.clerkClient.users.createUser({
        emailAddress: [email],
        password,
        firstName: name?.split(' ')[0],
        lastName: name?.split(' ').slice(1).join(' '),
      });
    } catch (error: any) {
      if (
        error.status === 422 &&
        error.errors?.[0]?.code === 'form_identifier_exists'
      ) {
        const users = await this.clerkClient.users.getUserList({
          emailAddress: [email],
        });
        if (users.data.length > 0) {
          clerkUser = users.data[0];
          isExistingUser = true;
        } else {
          throw new Error('User exists in Clerk but could not be retrieved');
        }
      } else {
        throw error;
      }
    }

    // 2. Create or update auth_users
    let authUser = await this.authUserRepository.findOne({
      where: { email },
    });

    if (authUser) {
      if (authUser.clerkUserId !== clerkUser.id) {
        authUser.clerkUserId = clerkUser.id;
        authUser.firstName = clerkUser.firstName || authUser.firstName;
        authUser.lastName = clerkUser.lastName || authUser.lastName;
        authUser = await this.authUserRepository.save(authUser);
      }
    } else {
      authUser = await this.authUserRepository.save(
        this.authUserRepository.create({
          clerkUserId: clerkUser.id,
          email,
          firstName: clerkUser.firstName || undefined,
          lastName: clerkUser.lastName || undefined,
        }),
      );
    }

    // 3. Create Person record if not exists
    let person = await this.personRepository.findOne({
      where: { authUserId: authUser.id },
    });

    if (!person) {
      person = await this.personRepository.save(
        this.personRepository.create({
          authUserId: authUser.id,
          email,
        }),
      );
    }

    // 4. Issue JWT
    return {
      message: isExistingUser
        ? 'User already registered, login successful'
        : 'Registration successful',
      token: this.signJwt({ sub: clerkUser.id, email }),
    };
  }

  async login(loginDto: LoginDto): Promise<{ message: string; token: string }> {
    const { email } = loginDto;

    const authUser = await this.authUserRepository.findOne({
      where: { email },
    });
    if (!authUser) throw new Error('Invalid email or password');

    return {
      message: 'Login successful',
      token: this.signJwt({ sub: authUser.clerkUserId, email: authUser.email }),
    };
  }

  async logout(): Promise<{ message: string }> {
    return { message: 'Logout successful' };
  }

  async getMe(user: any) {
    const clerkUserId = user?.sub || user?.id;
    if (!clerkUserId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Ensure we have a matching AuthUser record. If not, attempt to auto-sync from Clerk.
    let authUser = await this.authUserRepository.findOne({
      where: { clerkUserId },
    });

    if (!authUser) {
      // Try to sync user data from Clerk if we can.
      let clerkUser: any;
      try {
        clerkUser = await this.clerkClient.users.getUser(clerkUserId);
      } catch (error) {
        throw new NotFoundException('User not found');
      }

      const email =
        clerkUser?.emailAddresses?.[0]?.emailAddress ||
        clerkUser?.primaryEmailAddress ||
        clerkUser?.email ||
        '';

      authUser = await this.authUserRepository.save(
        this.authUserRepository.create({
          clerkUserId,
          email,
          firstName: clerkUser?.firstName,
          lastName: clerkUser?.lastName,
        }),
      );
    }

    // Ensure Person record exists for the auth user
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
      personId: person.id,
    };
  }
}
