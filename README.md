# Monorepo

A Turborepo monorepo with Nuxt web app and Capacitor mobile app sharing Vue components.

## Structure

```
├── apps/
│   ├── web/          # Nuxt 4 web app (SSR)
│   └── mobile/       # Capacitor mobile app (iOS & Android)
├── packages/
│   ├── ui/           # Shared Vue components
│   └── config/       # Shared configs (TypeScript, ESLint, Tailwind)
```

## Tech Stack

- **Build System:** Turborepo
- **Web Framework:** Nuxt 4 with SSR
- **Mobile Framework:** Capacitor 6
- **UI Library:** Vue 3 + HeadlessUI
- **Styling:** Tailwind CSS
- **Language:** TypeScript

## Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- For iOS: Xcode (macOS only)
- For Android: Android Studio

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Run all apps in development mode:

```bash
npm run dev
```

Run specific apps:

```bash
# Web app only
npm run dev --filter=@repo/web

# Mobile app only
npm run dev --filter=@repo/mobile
```

### Build

Build all packages and apps:

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run type-check
```

## Testing

Tests use [Vitest](https://vitest.dev/) with happy-dom. Test files live next to source files as `*.test.ts`.

Run all tests:

```bash
npm test
```

Run tests for a single package:

```bash
npm run test:api
npm run test:ui
npm run test:mobile
```

Watch mode (re-runs on file change):

```bash
npm run test:watch
```

Results are cached by Turborepo — unchanged packages skip re-running.

## Mobile Development

### Setup Capacitor Platforms

After building the mobile app, add the native platforms:

```bash
cd apps/mobile

# Build the web assets
npm run build

# Add iOS platform (macOS only)
npx cap add ios

# Add Android platform
npx cap add android

# Sync web assets to native projects
npm run cap:sync
```

### Running on Devices

```bash
cd apps/mobile

# Open iOS project in Xcode
npm run cap:open:ios

# Open Android project in Android Studio
npm run cap:open:android

# Run on iOS device/simulator
npm run cap:run:ios

# Run on Android device/emulator
npm run cap:run:android
```

### Live Reload

For development with live reload on a device:

1. Start the dev server: `npm run dev --filter=@repo/mobile`
2. Update `capacitor.config.ts` to point to your dev server:

```typescript
server: {
  url: 'http://YOUR_IP:5173',
  cleartext: true,
}
```

3. Run `npm run cap:sync` and launch the app on your device

## Shared Packages

### @repo/ui

Shared Vue components using HeadlessUI:

- `Button` - Customizable button with variants and sizes
- `Modal` - Accessible modal dialog
- `Card` - Content card with header/footer slots

Usage:

```vue
<script setup lang="ts">
import { Button, Card, Modal } from '@repo/ui';
</script>
```

### @repo/config

Shared configurations:

- TypeScript base and Nuxt configs
- ESLint base and Nuxt configs
- Tailwind CSS base config

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all packages and apps |
| `npm run lint` | Lint all packages |
| `npm run type-check` | Type check all packages |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:api` | Test `@repo/api` only |
| `npm run test:ui` | Test `@repo/ui` only |
| `npm run test:mobile` | Test `@repo/mobile` only |
| `npm run clean` | Clean all build outputs and dependencies |
| `npm run format` | Format code with Prettier |

## License

MIT
