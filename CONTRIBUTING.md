# Contributing to Fediway

## Quick start

```bash
npm install
npm run dev:web:mock
```

Opens at `http://localhost:3333` with mock data — no Mastodon instance needed.

For native iOS/Android development, see [`apps/mobile/README.md`](apps/mobile/README.md).

## Project structure

```
apps/
  web/            # Nuxt 4 web app
  mobile/         # Capacitor (iOS/Android)
packages/
  ui/             # Shared Vue 3 components
  api/            # API client and composables
  types/          # TypeScript type definitions
  config/         # Shared ESLint, TypeScript, Tailwind, Vitest configs
```

## Conventions

### Code style

Enforced by ESLint (`@antfu/eslint-config`). Run `npm run lint:fix` to auto-fix. No Prettier — ESLint handles formatting.

### Vue patterns

`<script setup lang="ts">` only. Order: imports, props/emits, composables, state, computed, functions, watchers, lifecycle.

```vue
<script setup lang="ts">
import type { Item } from '@repo/types';
import { computed, ref } from 'vue';

const props = defineProps<{ item: Item }>();
const emit = defineEmits<{ select: [id: string] }>();

const route = useRoute();
const isOpen = ref(false);
const title = computed(() => props.item.title);

function toggle() {
  isOpen.value = !isOpen.value;
}

onMounted(() => { /* ... */ });
</script>
```

Use `ref` over `reactive`. Type-based `defineProps<{}>()` and labeled tuple `defineEmits<{}>()`.

### File naming

- **Components:** PascalCase (`StatusCard.vue`)
- **Directories:** lowercase (`components/status/`)
- **Composables:** `useX.ts` exporting `useX()`
- **Types:** PascalCase (`FediwayStatus`)

### Code organization

Colocate by concept, not by role — everything about items goes in `item/`. One file per concept, not per variant.

### Comments

Default to no comment. Write self-documenting code — clear names, small functions, strong types.

When you do comment, explain **why**, never what:

```ts
// Offset-based pagination is unreliable on federated timelines
const maxId = parseLinkHeader(response.headers.link);
```

- JSDoc (`/** */`) on exported functions and component props only.
- No section dividers (`// ──`, `// ---`). If a file needs them, split it.
- No template comments that restate the element.
- TODOs must have context: `// TODO(#123): Replace when browser support >90%`
- Never commit commented-out code.

### Barrel exports

Use `index.ts` at package boundaries. Don't nest barrels inside apps — Nuxt auto-imports handle that.

## Mock mode

Mock data lives in `packages/api/src/mock/` — shared across web and mobile. Set `VITE_API_MODE=mock` or `live` in `apps/web/.env.development`. The env var takes priority over localStorage.

```bash
npm run dev:web:mock   # mock data (default)
npm run dev:web:live   # real Mastodon API
```

## Testing

```bash
npm test               # all tests
npm run test:api       # API package
npm run test:ui        # UI package
npm run test:watch     # watch mode
```

Tests live next to source files (`useAuth.ts` → `useAuth.test.ts`).

## Pull requests

- One PR per concern — don't bundle unrelated changes
- Run `npm run lint` and `npm run type-check` before opening
- Keep PRs small and reviewable (under ~400 lines when possible)
- The pre-commit hook runs `eslint --fix` on staged files
- CI runs lint, type-check, and tests on every PR
