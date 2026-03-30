# =============================================================================
# Fediway Web — Multi-stage Docker build
#
# Produces a minimal Node.js image running the Nuxt server.
# Supports SSR when enabled in nuxt.config.ts (currently SPA mode).
#
# Build:  docker build -f apps/web/Dockerfile -t fediway/web .
# Run:    docker run -p 3000:3000 fediway/web
#
# Runtime env vars:
#   NUXT_PUBLIC_DEFAULT_INSTANCE  — Mastodon instance domain (default: fediway.com)
# =============================================================================

# ---------------------
# Stage 1: Build
# ---------------------
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files first — cached layer until deps change
COPY package.json package-lock.json turbo.json ./
COPY apps/web/package.json apps/web/
COPY packages/ui/package.json packages/ui/
COPY packages/api/package.json packages/api/
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/

RUN npm ci

COPY . .

ARG NUXT_PUBLIC_DEFAULT_INSTANCE=fediway.com
ENV NUXT_PUBLIC_DEFAULT_INSTANCE=${NUXT_PUBLIC_DEFAULT_INSTANCE}

RUN npx turbo run build --filter=@repo/web

# ---------------------
# Stage 2: Run
# ---------------------
FROM node:22-alpine

WORKDIR /app

RUN addgroup -S fediway && adduser -S fediway -G fediway

COPY --from=build --chown=fediway:fediway /app/apps/web/.output .output

USER fediway

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/_health || exit 1

CMD ["node", ".output/server/index.mjs"]
