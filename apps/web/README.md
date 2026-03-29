# Fediway Web

Nuxt 4 SPA (client-side only, no SSR). Connects to any Mastodon-compatible instance.

## Development

```bash
npm run dev:web:mock   # mock data, no login needed
npm run dev:web:live   # real Mastodon API
```

## Build

```bash
npm run build          # builds via Turborepo
```

### Docker

```bash
docker build -f apps/web/Dockerfile -t fediway/web .
docker run -p 3000:80 fediway/web
```

The Dockerfile uses a multi-stage build (Node → nginx) and pre-compresses static assets.

## E2E tests

E2E tests run against a **production build**, not the dev server. Playwright intercepts API calls at the network level — no mock code in the production bundle.

```bash
npx nuxt build --cwd apps/web
npx playwright test --config=apps/web/e2e/playwright.config.ts
```

Tests, fixtures, and helpers live in `apps/web/e2e/`.
