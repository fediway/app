<script setup lang="ts">
import { PhMagnifyingGlass, PhX } from '@phosphor-icons/vue';
import { ref } from 'vue';

interface Props {
  title?: string;
}

defineProps<Props>();

const searchQuery = ref('');

function handleSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    searchQuery.value = '';
    return;
  }
  if (event.key === 'Enter' && searchQuery.value.trim()) {
    navigateTo({ path: '/search', query: { q: searchQuery.value } });
  }
}

function clearSearch() {
  searchQuery.value = '';
}

const tabs = [
  { label: 'For you', to: '/explore' },
  { label: 'News', to: '/explore/news' },
  { label: 'Tags', to: '/explore/tags' },
  { label: 'People', to: '/explore/people' },
] as const;
</script>

<template>
  <div class="sticky top-0 z-10 border-b border-border bg-card/80 px-4 py-3 backdrop-blur">
    <h1 class="mb-3 text-xl font-bold text-foreground">
      {{ title || 'Explore' }}
    </h1>

    <!-- Search Input -->
    <div class="relative">
      <PhMagnifyingGlass :size="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search..."
        class="w-full rounded-full bg-muted py-2 pl-10 pr-4 text-[15px] text-foreground outline-hidden transition-colors placeholder:text-foreground/40 focus:bg-card focus:ring-2 focus:ring-ring"
        @keydown="handleSearchKeydown"
      >
      <button
        v-if="searchQuery"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/80"
        @click="clearSearch"
      >
        <PhX :size="20" />
      </button>
    </div>

    <!-- Navigation Tabs -->
    <nav class="mt-3 flex gap-1">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="rounded-full px-4 py-2 text-sm font-medium no-underline transition-colors" :class="[
          $route.path === tab.to
            ? 'bg-foreground text-background'
            : 'bg-muted text-foreground/80 hover:bg-muted/80',
        ]"
      >
        {{ tab.label }}
      </NuxtLink>
    </nav>
  </div>
</template>
