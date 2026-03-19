<script setup lang="ts">
import { TagList } from '@repo/ui';
import { computed } from 'vue';
import { useData } from '~/composables/useData';

const router = useRouter();
const { getTrendingTags } = useData();

const trendingTags = computed(() =>
  getTrendingTags().slice(0, 10).map(tag => ({
    name: tag.name,
    postCount: tag.history?.reduce((sum: number, h: { uses: string }) => sum + Number(h.uses), 0) ?? undefined,
  })),
);

function handleTagClick(name: string) {
  router.push(`/tags/${name}`);
}
</script>

<template>
  <div class="w-full">
    <ExploreHeader />

    <div class="p-4">
      <h2 class="mb-3 text-sm font-medium text-gray-500">
        Trending now
      </h2>
      <TagList
        :tags="trendingTags"
        @tag-click="handleTagClick"
      />
    </div>
  </div>
</template>
