<script setup lang="ts">
import { TagList } from '@repo/ui';
import { computed } from 'vue';
import { useData } from '~/composables/useData';

const router = useRouter();
const { getTrendingTags, getStatusesByTag } = useData();

const trendingTags = computed(() =>
  getTrendingTags().map(tag => ({
    name: tag.name,
    postCount: getStatusesByTag(tag.name).length,
  })),
);

function handleTagClick(name: string) {
  router.push(`/tags/${name}`);
}
</script>

<template>
  <div class="w-full">
    <ExploreHeader title="Explore" />

    <TagList
      :tags="trendingTags"
      @tag-click="handleTagClick"
    />
  </div>
</template>
