import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verifyToken } from '@clerk/backend';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      path?: string;
      url?: string;
      originalUrl?: string;
      auth?: unknown;
    }>();

    const requestPath =
      request.path ?? request.url ?? request.originalUrl ?? '';
    if (requestPath.startsWith('/api')) {
      return true;
    }

    const authHeaderValue = request.headers.authorization;
    const authHeaderStr = Array.isArray(authHeaderValue)
      ? (authHeaderValue[0] ?? '')
      : (authHeaderValue ?? '');
    const [scheme, token] = authHeaderStr.split(' ');

    if (!token || scheme?.toLowerCase() !== 'bearer') {
      throw new UnauthorizedException('Missing Bearer token');
    }

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new InternalServerErrorException('Clerk secret key not configured');
    }

    try {
      const payload = await verifyToken(token, { secretKey });
      request.auth = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException(
        'Invalid or expired token: ' +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  }
}
