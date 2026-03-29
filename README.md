# Fediway

An open-source client for Mastodon.

Built with Vue 3, Nuxt 4, and Capacitor — web and mobile from a single codebase.

**Web** — [fediway.com](https://fediway.com)
**Mobile** — iOS and Android apps in active development

<!-- TODO: Add screenshot/demo GIF here -->

## Getting started

```bash
npm install
npm run dev:web:mock
```

Opens at `http://localhost:3333` with mock data — no Mastodon instance needed.

## Tech stack

Vue 3.5, TypeScript 5.8, Tailwind CSS 4, shadcn-vue (Reka UI), Pinia, Vitest, Playwright.

## Structure

```
apps/
  web/              Nuxt 4 SPA web app
  mobile/           Capacitor 8 (iOS & Android)
  storybook/        Storybook 8 component docs
packages/
  ui/               Shared Vue 3 components
  api/              API client, composables, cache
  types/            Shared TypeScript types
  config/           Shared configs (ESLint, TypeScript, Tailwind, Vitest)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps |
| `npm run dev:web:mock` | Web with mock data |
| `npm run dev:web:live` | Web with real Mastodon API |
| `npm run dev:mobile:mock` | Mobile with mock data |
| `npm run dev:storybook` | Storybook on port 6006 |
| `npm run build` | Build all |
| `npm run lint` | Lint all |
| `npm run lint:fix` | Auto-fix lint |
| `npm run type-check` | Type-check all |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:api` | API package tests |
| `npm run test:ui` | UI package tests |

## Testing

Unit tests use [Vitest](https://vitest.dev/) with happy-dom. Test files live next to source as `*.test.ts`.

E2E tests use [Playwright](https://playwright.dev/) against a production build. See `apps/web/e2e/`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for code conventions, Vue patterns, and development workflow. For native mobile setup, see [`apps/mobile/README.md`](apps/mobile/README.md).

## License

[AGPL-3.0](LICENSE)
