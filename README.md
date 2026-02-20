# Fediway

A Turborepo monorepo with Nuxt web app and Capacitor mobile app sharing Vue components, an API client, and TypeScript types.

## Structure

```
apps/web/           Nuxt 4 web app (SSR)
apps/mobile/        Capacitor 6 mobile app (iOS & Android)
packages/ui/        Shared Vue 3 components
packages/api/       API client, composables, cache, offline queue
packages/types/     Shared TypeScript types
packages/config/    Shared configs (ESLint, TypeScript, Tailwind, Vitest)
```

## Prerequisites

- Node.js >= 20, npm >= 10
- For iOS: Xcode (macOS only)
- For Android: Android Studio

## Getting Started

```bash
npm install
npm run dev:web:mock   # web app with mock data — no login needed
```

The dev server starts at `http://localhost:3333`. See [CONTRIBUTING.md](CONTRIBUTING.md) for code conventions and Vue patterns.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps |
| `npm run dev:mock` | Start all apps with mock data |
| `npm run dev:web:mock` | Web app with mock data |
| `npm run dev:web:live` | Web app with real Mastodon API |
| `npm run dev:mobile:mock` | Mobile app with mock data |
| `npm run build` | Build all packages and apps |
| `npm run lint` | Lint all packages |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run type-check` | Type-check all packages |
| `npm test` | Run all tests |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:api` | Test API package only |
| `npm run test:ui` | Test UI package only |
| `npm run test:mobile` | Test mobile app only |
| `npm run clean` | Clean build outputs and node_modules |

## Testing

Tests use [Vitest](https://vitest.dev/) with happy-dom. Test files live next to source files as `*.test.ts`. Results are cached by Turborepo — unchanged packages skip re-running.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md#dev-setup) for web, iOS, and Android setup, including prerequisites, live reload, and device debugging.

## License

MIT
