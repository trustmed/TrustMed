# ---------- base ----------
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# ---------- installer ----------
FROM base AS installer

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/core-backend ./apps/core-backend
COPY packages ./packages

RUN pnpm install --frozen-lockfile

# ---------- builder ----------
FROM installer AS builder
WORKDIR /app/apps/core-backend
RUN pnpm build

# ---------- runner ----------
FROM node:20-alpine AS runner
RUN corepack enable
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy package files for workspace structure
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/core-backend/package.json ./apps/core-backend/
COPY packages ./packages

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Copy built application
COPY --from=builder /app/apps/core-backend/dist ./apps/core-backend/dist

WORKDIR /app/apps/core-backend

EXPOSE 3001

CMD ["node", "dist/main.js"]