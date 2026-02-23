<script setup lang="ts">
import { computed } from 'vue';
import { useData } from '~/composables/useData';

const { getTrendingTags, getStatusesByTag } = useData();

const trendingTags = computed(() => {
  return getTrendingTags().map(tag => ({
    ...tag,
    postCount: getStatusesByTag(tag.name).length,
  }));
});
</script>

<template>
  <div class="w-full">
    <ExploreHeader title="Explore" />

    <div class="divide-y divide-gray-100">
      <NuxtLink
        v-for="tag in trendingTags"
        :key="tag.id"
        :to="`/tags/${tag.name}`"
        class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left no-underline"
      >
        <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <span class="text-xl text-gray-500">#</span>
        </div>
        <div class="flex-1">
          <div class="font-medium text-gray-900">
            #{{ tag.name }}
          </div>
          <div class="text-sm text-gray-500">
            Trending
          </div>
        </div>
        <div class="text-sm text-gray-400">
          {{ tag.postCount }} posts
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
