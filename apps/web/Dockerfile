# =============================================================================
# Fediway Web — Multi-stage Docker build
#
# Produces a minimal nginx image (~25MB) serving the static SPA.
# No Node.js runtime needed — all rendering happens client-side.
#
# Build:  docker build -f apps/web/Dockerfile -t fediway/web .
# Run:    docker run -p 8080:8080 fediway/web
#
# Runtime env vars (optional):
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

# Install dependencies (ci = deterministic, no devDeps surprises)
RUN npm ci

# Copy source
COPY . .

# Build-time configuration (overridable via --build-arg)
ARG NUXT_PUBLIC_DEFAULT_INSTANCE=fediway.com
ENV NUXT_PUBLIC_DEFAULT_INSTANCE=${NUXT_PUBLIC_DEFAULT_INSTANCE}

# Generate static files (SPA mode — pure HTML/JS/CSS, no Node server)
RUN npx nuxt generate --cwd apps/web

# Pre-compress static assets for nginx gzip_static
RUN apk add --no-cache gzip \
    && find apps/web/.output/public/_nuxt -type f \
       \( -name "*.js" -o -name "*.css" -o -name "*.svg" -o -name "*.json" \) \
       -exec gzip -9 -k {} \;

# ---------------------
# Stage 2: Serve
# ---------------------
FROM nginx:1.27-alpine

# Replace default config with SPA-optimized config
RUN rm /etc/nginx/conf.d/default.conf
COPY apps/web/docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files from build stage
COPY --from=build /app/apps/web/.output/public /usr/share/nginx/html

# Runtime env injection script (runs before nginx starts)
COPY apps/web/docker/entrypoint.sh /docker-entrypoint.d/40-inject-env.sh
RUN chmod +x /docker-entrypoint.d/40-inject-env.sh

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
