import { Controller, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { CoreProxyService } from '../core-proxy/core-proxy.service.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly coreProxy: CoreProxyService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login via core-backend and proxy the auth cookie' })
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.coreProxy.forward<any>('POST', '/auth/login', {
      data: body,
    });

    // Forward the Set-Cookie headers from core-backend
    const setCookieHeaders = result.headers['set-cookie'];
    if (setCookieHeaders) {
      const cookies = Array.isArray(setCookieHeaders)
        ? setCookieHeaders
        : [setCookieHeaders];
      for (const cookie of cookies) {
        res.append('Set-Cookie', cookie);
      }
    }

    return result.data;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and clear session cookie' })
  async logout(@Res({ passthrough: true }) res: Response) {
    const result = await this.coreProxy.forward('POST', '/auth/logout');

    const setCookieHeaders = result.headers['set-cookie'];
    if (setCookieHeaders) {
      const cookies = Array.isArray(setCookieHeaders)
        ? setCookieHeaders
        : [setCookieHeaders];
      for (const cookie of cookies) {
        res.append('Set-Cookie', cookie);
      }
    }

    return result.data;
  }
}
