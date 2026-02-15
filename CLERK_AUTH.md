# Clerk Auth Integration

This document explains the Clerk authentication integration for the TrustMed core frontend and core backend, and how to configure the required keys.

## What Was Implemented

### Frontend (apps/core-frontend)
- Added Clerk provider at the app root so Clerk can manage sessions across the UI.
- Added Next.js middleware to protect all routes except the public pages.
- Connected the existing custom sign-in and sign-up views to Clerk email/password and Google OAuth.

Public routes (no auth required):
- /
- /signin
- /signup
- /legal/*

All other routes are protected and will require authentication.

### Backend (apps/core-backend)
- Added a global NestJS guard that verifies Clerk JWTs on every request.
- Allowed public access to:
  - /
  - /health
  - /api (Swagger)

All other API routes require a valid Clerk Bearer token in the Authorization header.

## Required Environment Variables

### Frontend
Add this to your frontend environment file (for example, apps/core-frontend/.env.local):

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

### Backend
Add this to your backend environment file (for example, apps/core-backend/.env):

CLERK_SECRET_KEY=sk_...

## Clerk Dashboard Configuration

1. Create or open your application in the Clerk dashboard.
2. Go to API Keys and copy:
   - Publishable key (used by the frontend)
   - Secret key (used by the backend)
3. Go to OAuth providers and enable Google if you want Google sign-in.
4. Set the redirect URLs to include:
   - http://localhost:3000/signin
   - http://localhost:3000/signup
   - http://localhost:3000/portal

Update the URLs for your production domain when you deploy.

## How the Frontend Auth Flow Works

- Sign In: the custom sign-in view calls Clerk with email and password. When successful, a session is created and the user is routed to /portal.
- Sign Up: the custom sign-up view creates a user in Clerk. If verification is required, the user is redirected to sign in after completing verification in Clerk.
- Google OAuth: the existing buttons now call Clerk's OAuth redirect flow.

## How the Backend Auth Works

For protected API routes, send a Clerk session token:

Authorization: Bearer <clerk_session_token>

The backend validates the token with the Clerk secret key and rejects invalid or missing tokens.

## Local Development Checklist

1. Add the environment variables described above.
2. Start the frontend:
   - pnpm --filter @trustmed/core-frontend dev
3. Start the backend:
   - pnpm --filter @trustmed/core-backend dev
4. Verify:
   - / and /health are public
   - /portal and other protected routes require authentication
