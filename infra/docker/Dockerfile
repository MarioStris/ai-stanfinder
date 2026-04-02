# ============================================================
# Stage 1: Builder
# ============================================================
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy workspace manifests + lockfile
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY turbo.json ./

# Copy app and shared package manifests for dependency resolution
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy Prisma schema first so generate can run
COPY prisma/ ./prisma/

# Generate Prisma client
RUN pnpm --filter @ai-stanfinder/api run db:generate

# Copy full source
COPY apps/api/ ./apps/api/

# Build with esbuild (fast, no module resolution issues in monorepo)
RUN pnpm run build

# Prune to production-only dependencies
RUN pnpm --filter @ai-stanfinder/api deploy --prod /app/production

# ============================================================
# Stage 2: Runner
# ============================================================
FROM node:20-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono

WORKDIR /app

# Copy production dependencies and built output
COPY --from=builder --chown=hono:nodejs /app/production/node_modules ./node_modules
COPY --from=builder --chown=hono:nodejs /app/production/package.json ./package.json
COPY --from=builder --chown=hono:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=hono:nodejs /app/prisma ./prisma

# Switch to non-root user
USER hono

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

# Health check — matches /api/health route in src/index.ts
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/index.js"]
