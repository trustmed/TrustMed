# ---------- base ----------
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# ---------- installer ----------
FROM base AS installer

# 1.Copy ONLY dependency files first to maximize Docker caching!
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/core-frontend/package.json ./apps/core-frontend/package.json
COPY packages/components/package.json ./packages/components/package.json

# Install dependencies 
RUN pnpm install --frozen-lockfile --config.fetch-retries=5 --config.fetch-timeout=300000

# 2. Now copy the actual source code
COPY apps/core-frontend ./apps/core-frontend
COPY packages/components ./packages/components

# ---------- builder ----------
FROM installer AS builder
WORKDIR /app/apps/core-frontend

# 3. FIX: Read env vars from a .env file (as discussed earlier) or use BuildKit secrets
COPY apps/core-frontend/.env.production .env.production

# Build Next.js
RUN pnpm build

# ---------- runner ----------
FROM node:20-alpine AS runner
RUN corepack enable
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000


# Copy standalone build
COPY --from=builder /app/apps/core-frontend/.next/standalone ./
# Static assets for Next.js
COPY --from=builder /app/apps/core-frontend/.next/static ./apps/core-frontend/.next/static
# Public assets
COPY --from=builder /app/apps/core-frontend/public ./apps/core-frontend/public

USER node

EXPOSE 3000

CMD ["node", "apps/core-frontend/server.js"]