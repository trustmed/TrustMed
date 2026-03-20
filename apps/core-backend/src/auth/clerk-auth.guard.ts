import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { Reflector } from '@nestjs/core';
import { verifyToken } from '@clerk/backend';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './public.decorator';
import type { JwtPayload } from './jwt-payload.interface';

interface AuthenticatedRequest extends ExpressRequest {
  auth?: JwtPayload;
  user?: JwtPayload;
  cookies: Record<string, string>;
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authHeaderValue = request.headers.authorization;
    const authHeaderStr: string =
      (Array.isArray(authHeaderValue) ? authHeaderValue[0] : authHeaderValue) ||
      '';
    const [scheme, headerToken] = authHeaderStr.split(' ');

    // Accept either Authorization: Bearer <token> OR cookie `access_token` (used by the frontend).
    const token =
      (scheme?.toLowerCase() === 'bearer'
        ? headerToken
        : request.cookies?.access_token) || '';

    if (!token) {
      throw new UnauthorizedException(
        'Missing Bearer token or access_token cookie',
      );
    }

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new InternalServerErrorException('Clerk secret key not configured');
    }

    // 1) Try to validate using the app's JWT secret (stored in JWT_SECRET).
    try {
      const payload = this.jwtService.verify(token);
      request.auth = payload;

      request.user = payload;
      return true;
    } catch (jwtError) {
      console.warn(
        'JWT verification failed (falling back to Clerk):',
        jwtError,
      );
    }

    // 2) Fall back to Clerk token verification (for Clerk-issued tokens).
    try {
      const payload = await (
        verifyToken as unknown as (
          token: string,
          opts: { secretKey: string },
        ) => Promise<JwtPayload>
      )(token, { secretKey });
      request.auth = payload;

      request.user = payload;
      return true;
    } catch (clerkError) {
      throw new UnauthorizedException(
        'Invalid or expired token: ' +
          (clerkError instanceof Error
            ? clerkError.message
            : String(clerkError)),
      );
    }
  }
}
