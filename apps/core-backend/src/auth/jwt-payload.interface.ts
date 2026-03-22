/**
 * Shape of the JWT payload issued by {@link AuthService.signJwt}.
 *
 * `sub` is the **Clerk user ID** (e.g. `user_abc123`), not a UUID.
 * To get the internal UUID, resolve `sub` → `AuthUser.clerkUserId` → `AuthUser.id`.
 */
export interface JwtPayload {
  /** Clerk user ID (the JWT "subject"). */
  sub: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  /** Issued-at (epoch seconds) — injected by NestJS JwtService. */
  iat?: number;
  /** Expiration (epoch seconds) — injected by NestJS JwtService. */
  exp?: number;
  /** Internal UUID (optional) */
  id?: string;
}
