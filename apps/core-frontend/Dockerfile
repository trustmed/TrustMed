# ---------- base ----------
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# ---------- installer ----------
FROM base AS installer

# Copy root lockfile & workspace manifest
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy all workspace packages (components + core-frontend)
COPY apps/core-frontend ./apps/core-frontend
# Adjust the path below if your shared components live somewhere else
COPY packages/components ./packages/components

# Install all dependencies (workspace linking works)
RUN pnpm install --frozen-lockfile

# ---------- builder ----------
FROM installer AS builder
WORKDIR /app/apps/core-frontend

# Build Next.js
RUN pnpm build

# ---------- runner ----------
FROM node:20-alpine AS runner
RUN corepack enable
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone build (monorepo paths are nested under apps/core-frontend)
COPY --from=builder /app/apps/core-frontend/.next/standalone ./
# Static assets for Next.js
COPY --from=builder /app/apps/core-frontend/.next/static ./apps/core-frontend/.next/static
# Public assets
COPY --from=builder /app/apps/core-frontend/public ./apps/core-frontend/public

EXPOSE 3000

CMD ["node", "apps/core-frontend/server.js"]