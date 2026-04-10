import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';

/**
 * Parameter decorator that extracts the authenticated user's JWT payload
 * from the request object (set by {@link JwtCookieGuard}).
 *
 * Usage:
 * ```ts
 * @Get('me')
 * getMe(@CurrentUser() user: JwtPayload) { ... }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    return request.user;
  },
);
