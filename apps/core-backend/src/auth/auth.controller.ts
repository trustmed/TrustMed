import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response, CookieOptions } from 'express';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthMessageDto } from './dto/auth-message.dto';
import { ErrorResponseDto } from './dto/error-response.dto';

/** Parse JWT_EXPIRES_IN (e.g. "7d", "24h", "60m") into milliseconds. */
function parseExpiry(value: string | undefined): number {
  const FALLBACK_MS = 1 * 24 * 60 * 60 * 1000; // 1 days
  if (!value) return FALLBACK_MS;
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) return FALLBACK_MS;
  const amount = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return amount * multipliers[unit];
}

const COOKIE_NAME = 'access_token';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV !== 'development',
  path: '/',
  maxAge: parseExpiry(process.env.JWT_EXPIRES_IN),
};

if (COOKIE_DOMAIN) {
  COOKIE_OPTIONS.domain = COOKIE_DOMAIN;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthMessageDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    type: ErrorResponseDto,
  })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthMessageDto> {
    const token = await this.authService.login(body.email, body.password);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    return { message: 'Login successful' };
  }

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new account' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    type: AuthMessageDto,
  })
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthMessageDto> {
    const token = await this.authService.register(
      body.email,
      body.password,
      body.firstName,
      body.lastName,
    );
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    return { message: 'Registration successful' };
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and clear session cookie' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    type: AuthMessageDto,
  })
  logout(@Res({ passthrough: true }) res: Response): AuthMessageDto {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return { message: 'Logout successful' };
  }
}
