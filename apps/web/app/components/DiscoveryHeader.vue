<script setup lang="ts">
import { PhMagnifyingGlass, PhX } from '@phosphor-icons/vue';

interface RouteTab {
  label: string;
  to: string;
}

interface ValueTab {
  label: string;
  value: string;
}

type Tab = RouteTab | ValueTab;

interface Props {
  tabs?: Tab[];
  searchPlaceholder?: string;
}

withDefaults(defineProps<Props>(), {
  tabs: () => [],
  searchPlaceholder: 'Search...',
});

const emit = defineEmits<{
  search: [query: string];
}>();
const search = defineModel<string>('search', { default: '' });
const tab = defineModel<string>('tab');

const route = useRoute();

function isRouteTab(t: Tab): t is RouteTab {
  return 'to' in t;
}

function isActiveTab(t: Tab): boolean {
  if (isRouteTab(t))
    return route.path === t.to;
  return tab.value === t.value;
}

function handleTabClick(t: Tab) {
  if (!isRouteTab(t)) {
    tab.value = t.value;
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    search.value = '';
    return;
  }
  if (event.key === 'Enter' && search.value.trim()) {
    emit('search', search.value);
  }
}

function clearSearch() {
  search.value = '';
}
</script>

<template>
  <div class="sticky top-0 z-10 border-b border-border bg-card/80 px-4 py-3 backdrop-blur lg:top-[3.25rem]">
    <!-- Search Input -->
    <div class="relative">
      <PhMagnifyingGlass :size="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
      <input
        v-model="search"
        type="text"
        :placeholder="searchPlaceholder"
        class="w-full rounded-full bg-muted py-2 pl-10 pr-4 text-[15px] text-foreground outline-hidden transition-colors placeholder:text-foreground/40 focus:bg-card focus:ring-2 focus:ring-ring"
        @keydown="handleKeydown"
      >
      <button
        v-if="search"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/80"
        @click="clearSearch"
      >
        <PhX :size="20" />
      </button>
    </div>

    <!-- Tabs -->
    <nav v-if="tabs.length > 0" class="mt-3 flex gap-1">
      <component
        :is="isRouteTab(t) ? 'NuxtLink' : 'button'"
        v-for="t in tabs"
        :key="isRouteTab(t) ? t.to : t.value"
        :to="isRouteTab(t) ? t.to : undefined"
        class="rounded-full px-4 py-2 text-sm font-medium no-underline transition-colors"
        :class="[
          isActiveTab(t)
            ? 'bg-foreground text-background'
            : 'bg-muted text-foreground/80 hover:bg-muted/80',
        ]"
        @click="handleTabClick(t)"
      >
        {{ t.label }}
      </component>
    </nav>
  </div>
</template>
