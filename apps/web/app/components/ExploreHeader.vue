<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  title?: string;
}

defineProps<Props>();

const searchQuery = ref('');

function handleSearchKeydown(event: KeyboardEvent) {
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
  <div class="px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
    <h1 class="text-xl font-bold mb-3">
      {{ title || 'Explore' }}
    </h1>

    <!-- Search Input -->
    <div class="relative">
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search..."
        class="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-[15px] outline-hidden focus:ring-2 focus:ring-gray-300 focus:bg-white transition-colors"
        @keydown="handleSearchKeydown"
      >
      <button
        v-if="searchQuery"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        @click="clearSearch"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <!-- Navigation Tabs -->
    <nav class="flex gap-1 mt-3">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors no-underline" :class="[
          $route.path === tab.to
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        ]"
      >
        {{ tab.label }}
      </NuxtLink>
    </nav>
  </div>
</template>
