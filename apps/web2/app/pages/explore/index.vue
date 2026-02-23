<script setup lang="ts">
import { computed } from 'vue';
import { useData } from '~/composables/useData';

const { getTrendingTags } = useData();

const trendingTags = computed(() => getTrendingTags().slice(0, 10));
</script>

<template>
  <div class="w-full">
    <ExploreHeader />

    <!-- Trending Tags -->
    <div class="p-4">
      <h2 class="text-sm font-medium text-gray-500 mb-3">
        Trending now
      </h2>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          v-for="tag in trendingTags"
          :key="tag.id"
          :to="`/tags/${tag.name}`"
          class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors no-underline"
        >
          #{{ tag.name }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
