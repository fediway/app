# Contributing to Fediway

## Prerequisites

### All platforms

- Node.js 20+
- npm 10+

### iOS (macOS only)

- **Xcode 15+** — install from the Mac App Store
- **Xcode Command Line Tools** — `xcode-select --install`
- **CocoaPods** — `sudo gem install cocoapods` (Capacitor uses it for native plugin dependencies)
- **Apple Developer account** — free for simulator testing, $99/year program membership required for physical devices

### Android

- **Android Studio** — download from [developer.android.com/studio](https://developer.android.com/studio)
- **JDK 17** — bundled with Android Studio, verify with `java -version`
- **Android SDK** — install via Android Studio > Settings > SDK Manager:
  - SDK Platform: API 34 (Android 14) or newer
  - SDK Tools: Android SDK Build-Tools, Android Emulator, Android SDK Platform-Tools
- **Emulator image** — in SDK Manager > SDK Platforms, check "System Image" for your target API level
- **For physical devices** — enable Developer Options (tap Build Number 7 times in Settings > About Phone), then enable USB Debugging

## Dev setup

### Web (quickest start)

```bash
npm install
npm run dev:web:mock
```

Opens at `http://localhost:3333` with mock data — no Mastodon instance or login needed.

### iOS

First, do the web setup above (`npm install`). Then generate the native project:

```bash
cd apps/mobile
npm run build                # build the web bundle Capacitor will wrap
npx cap add ios              # generates ios/ directory (one-time)
npm run cap:sync             # copies web build + plugins into native project
```

Run on simulator or device:

```bash
npm run cap:run:ios          # picks a simulator, builds, and launches
npm run cap:open:ios         # opens Xcode — use this to pick a specific device/simulator
```

If using a physical device, Xcode will prompt you to select a signing team (your Apple Developer account) the first time.

### Android

First, do the web setup above (`npm install`). Then generate the native project:

```bash
cd apps/mobile
npm run build                # build the web bundle Capacitor will wrap
npx cap add android          # generates android/ directory (one-time)
npm run cap:sync             # copies web build + plugins into native project
```

Run on emulator or device:

```bash
npm run cap:run:android      # picks a running emulator or connected device
npm run cap:open:android     # opens Android Studio — use this to manage emulators
```

For physical devices, connect via USB and accept the debugging prompt on the phone.

### Live reload on device

Live reload lets you edit web code and see changes on the device instantly, without rebuilding the native project each time.

1. Start the mobile dev server (serves on your LAN):

```bash
npm run dev:mobile:mock      # or dev:mobile for default mode
```

2. Find your machine's LAN IP:

```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'

# Windows
ipconfig    # look for "IPv4 Address" under your active adapter
```

3. Edit `apps/mobile/capacitor.config.ts` — add a `server.url` pointing to your machine:

```
server: {
  url: 'http://192.168.1.42:5173',   // your LAN IP + dev server port
  cleartext: true,                     // required for http:// on Android
},
```

4. Sync and launch:

```bash
cd apps/mobile
npm run cap:sync
npm run cap:run:ios          # or cap:run:android
```

The app now loads from your dev server. Edit a `.vue` file, save, and the device updates via HMR.

**Important:** Remove the `server.url` block before committing — it's a local dev override, not a production setting.

### Debugging on device

- **iOS** — open Safari > Develop menu > select your device/simulator > inspect the WebView
- **Android** — open `chrome://inspect` in Chrome > select your device under "Remote Target"

Both give you the full browser DevTools (console, network, elements) running against the app on the device.

## Project structure

```
apps/
  web/            # Nuxt 4 (SSR web app)
  mobile/         # Capacitor 6 (native iOS/Android)
packages/
  ui/             # Shared Vue 3 components
  api/            # API client and composables
  types/          # TypeScript type definitions
  config/         # Shared ESLint, TypeScript, Tailwind, Vitest configs
```

## Conventions

### Code style

Enforced automatically by ESLint (`@antfu/eslint-config`). Run `npm run lint:fix` to auto-fix, or let VS Code do it on save (recommended extensions are in `.vscode/extensions.json`).

No Prettier — ESLint handles both linting and formatting.

### Vue patterns

**`<script setup lang="ts">` only.** Order your script setup like this:

```vue
<script setup lang="ts">
import type { Item } from '@repo/types';
// 1. Imports
import { computed, ref } from 'vue';

// 2. Props and emits
const props = defineProps<{ item: Item }>();
const emit = defineEmits<{ select: [id: string] }>();

// 3. Composables
const route = useRoute();

// 4. Reactive state
const isOpen = ref(false);

// 5. Computed
const title = computed(() => props.item.title);

// 6. Functions
function toggle() {
  isOpen.value = !isOpen.value;
}

// 7. Watchers
watch(() => props.item, () => { /* ... */ });

// 8. Lifecycle
onMounted(() => { /* ... */ });
</script>
```

**Use `ref`, not `reactive`.** `ref` works with any value type and stays reactive through reassignment and function calls.

**Type-based props and emits:**

```typescript
// Props — use defineProps<{}>(), not runtime declarations
const props = defineProps<{
  title: string;
  count?: number;
}>();

// Emits — use labeled tuple syntax
const emit = defineEmits<{
  select: [id: string];
  update: [value: number];
}>();
```

### File naming

- **Components:** PascalCase (`StatusCard.vue`, `ItemTypeIcon.vue`)
- **Directories:** lowercase (`components/status/`, `composables/`)
- **Composables:** `useX.ts` exporting `useX()` (`useTimeline.ts`)
- **Types:** PascalCase (`FediwayStatus`, `ItemType`)

### Code organization

Two rules:

1. **Colocate by concept, not by technical role.** Everything about items goes in `item/`, not scattered across `icons/`, `cards/`, `modals/`. When you change "how items work," everything is in one folder.

2. **One file per concept, not per variant.** A single `ItemTypeIcon.vue` with a `type` prop — not separate files for each icon. Fewer files, one place to change.

### Barrel exports

Use `index.ts` at package boundaries (`packages/ui/src/index.ts`). Don't nest barrels deep inside apps — Nuxt auto-imports handle that.

## Mock Mode

The app defaults to mock data for easy onboarding — no Mastodon instance needed.

### Dev scripts

```bash
npm run dev:web:mock   # web with mock data (default)
npm run dev:web:live   # web with real Mastodon API
npm run dev:mock       # all apps, mock
npm run dev            # all apps, default mode
```

### Environment variable

Set `VITE_API_MODE=mock` or `VITE_API_MODE=live` in `apps/web/.env.development`. The env var takes priority over localStorage.

### How it works

Mock data lives in `packages/api/src/mock/` — shared across web and mobile. The `createClient()` factory returns a mock or real client based on config. Composables call the client transparently — no mode branching needed.

## Testing

```bash
npm test                # Run all tests
npm run test:api        # API package only
npm run test:ui         # UI package only
npm run test:mobile     # Mobile app only
npm run test:watch      # Watch mode (all packages)
```

Tests live next to source files (`useAuth.ts` → `useAuth.test.ts`). We test logic (composables, stores, API client) — not UI components, since the design team iterates on those.

## Pull requests

- One PR per concern
- Run `npm run lint` and `npm run type-check` before opening
- The pre-commit hook runs `eslint --fix` on staged files automatically
- CI runs lint, type-check, and tests automatically on every PR
