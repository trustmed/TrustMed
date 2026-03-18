import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './register-dto';
import { LoginDto } from './login-dto';
import { Public } from './public.decorator';

function parseExpiry(value: string | undefined): number {
  if (!value) return 7 * 24 * 60 * 60; // 7 days default
  const ms = require('ms');
  return Math.floor(ms(value) / 1000);
}

const COOKIE_NAME = 'access_token';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

const isDev = process.env.NODE_ENV !== 'production';

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: !isDev,
  sameSite: isDev ? 'lax' : 'strict',
  domain: COOKIE_DOMAIN || undefined,
  maxAge: parseExpiry(process.env.JWT_EXPIRES_IN) * 1000,
};

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict';
  domain?: string;
  maxAge: number;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() response: Response) {
    const result = await this.authService.register(registerDto);
    response.cookie(COOKIE_NAME, result.token, COOKIE_OPTIONS);
    return response.json(result);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() response: Response) {
    const result = await this.authService.login(loginDto);
    response.cookie(COOKIE_NAME, result.token, COOKIE_OPTIONS);
    return response.json(result);
  }

  @Public()
  @Post('logout')
  async logout(@Res() response: Response) {
    const result = await this.authService.logout();
    response.clearCookie(COOKIE_NAME);
    return response.json(result);
  }

  @Get('me')
  async getMe(@Req() req: any) {
    // req.user should have the JWT payload (clerkUserId)
    const user = req.user;
    if (!user) {
      // Ensure the guard sends a proper 401 rather than a 500.
      throw new UnauthorizedException('Unauthorized');
    }

    // Get real user info from AuthService
    return this.authService.getMe(user);
  }
}
