# Auth Refactor Guide (Clerk via Backend + JWT Cookie)

## Why this was changed

Previously, the frontend authenticated directly with Clerk (`@clerk/nextjs`) and tried to pass Clerk tokens to backend APIs.

Now the flow is:

1. Frontend submits login/register to **core-backend**.
2. Backend validates user with **Clerk server SDK**.
3. Backend issues its own JWT and stores it in an **HttpOnly cookie** (`access_token`).
4. Frontend calls APIs with `withCredentials: true` and browser automatically sends cookie.
5. Backend guard validates JWT cookie on protected routes.

---

## What was implemented

## Backend (`apps/core-backend`)

### Added

- `src/auth/auth.module.ts`
- `src/auth/auth.service.ts`
- `src/auth/auth.controller.ts`
- `src/auth/jwt-cookie.guard.ts`

### Updated

- `src/app.module.ts`
  - Imports `AuthModule`.
  - Replaces global `ClerkAuthGuard` with `JwtCookieGuard`.
- `src/main.ts`
  - Adds `cookie-parser` middleware (`app.use(cookieParser())`).
- `.env.example`
  - Keeps `CLERK_SECRET_KEY`.
  - Adds:
    - `JWT_SECRET`
    - `JWT_EXPIRES_IN`

### New backend auth endpoints

All under global prefix `api`:

- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Validates credentials via Clerk server SDK.
  - Sets `access_token` HttpOnly cookie.
- `POST /api/auth/register`
  - Body: `{ email, password, firstName, lastName }`
  - Creates user in Clerk.
  - Sets `access_token` HttpOnly cookie.
- `POST /api/auth/logout`
  - Clears `access_token` cookie.

### Guard behavior

`JwtCookieGuard`:

- Skips routes marked with `@Public()`.
- Reads `access_token` from cookies.
- Verifies with `JWT_SECRET`.
- Attaches payload to `request.user`.
- Returns `401` if missing/invalid/expired.

---

## Frontend (`apps/core-frontend`)

### Updated

- `middleware.ts`
  - Removed Clerk middleware.
  - Protects non-public routes by checking `access_token` cookie presence.
  - Redirects to `/signin` if missing.
- `app/layout.tsx`
  - Removed `<ClerkProvider>`.
- `components/portal/signin.tsx`
  - Replaced Clerk sign-in calls with `POST /api/auth/login`.
- `components/portal/signup.tsx`
  - Replaced Clerk sign-up calls with `POST /api/auth/register`.
- `config/api-config/axios.ts`
  - Removed in-memory Bearer token injection.
  - Uses cookie auth via `withCredentials: true`.
  - Redirects to `/signin` on `401`.

### Deprecated/compat cleanup

- `config/api-config/authTokenStore.ts` (no-op comments)
- `config/api-config/useSyncAuthToken.ts` (no-op)
- `config/api-config/useAxios.tsx` now returns shared `axiosInstance` (cookie-based)

---

## How the flow works (runtime)

## 1) Register

1. User submits signup form.
2. Frontend calls `POST /api/auth/register`.
3. Backend creates Clerk user.
4. Backend signs JWT.
5. Backend sets `Set-Cookie: access_token=...; HttpOnly; SameSite=Lax; Path=/`.
6. Frontend navigates user to `/portal`.

## 2) Login

1. User submits signin form.
2. Frontend calls `POST /api/auth/login`.
3. Backend verifies password through Clerk.
4. Backend signs JWT and sets `access_token` cookie.
5. Frontend navigates to `/portal`.

## 3) Access protected API

1. Frontend API call uses axios with `withCredentials: true`.
2. Browser automatically sends `access_token` cookie.
3. `JwtCookieGuard` verifies cookie JWT.
4. Request continues if valid, else `401`.

## 4) Logout

1. Frontend calls `POST /api/auth/logout`.
2. Backend clears `access_token` cookie.
3. Next protected route/API call is unauthorized.

---

## Required environment variables

## Backend

- `CLERK_SECRET_KEY` (for server-side Clerk user verify/create)
- `JWT_SECRET` (for signing/verifying backend JWT)
- `JWT_EXPIRES_IN` (example: `7d`)

## Frontend

- `NEXT_PUBLIC_BACKEND_URL` (or existing API URL variable used by axios config)

---

## Security model

- JWT is stored in **HttpOnly cookie** (not readable by JS).
- API auth no longer depends on frontend-managed bearer tokens.
- Clerk is used only on backend as identity provider/user store.

---

## Notes / current limitations

- Google OAuth button logic was removed from signin/signup implementation in this refactor.
- The old `src/auth/clerk-auth.guard.ts` file still exists in repo history but is no longer active (not used as global guard).
- Frontend had pre-existing unrelated TypeScript issues in profile page; not part of this auth refactor.

---

## Quick manual test checklist

1. Start backend and frontend.
2. `POST /api/auth/register` from UI → cookie should be set.
3. Refresh and call protected API → should succeed.
4. Logout endpoint → cookie removed.
5. Access protected route/API again → redirected or `401`.
