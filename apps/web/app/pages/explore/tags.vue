<script setup lang="ts">
import { Skeleton, TagList } from '@repo/ui';
import { computed } from 'vue';

const router = useRouter();
const { getTrendingTags } = useExploreData();
const { data: tags, isLoading } = getTrendingTags();

const trendingTags = computed(() =>
  tags.value.map(tag => ({
    name: tag.name,
    postCount: tag.history?.[0]?.uses ? `${tag.history[0].uses} posts` : undefined,
  })),
);

function handleTagClick(name: string) {
  router.push(`/tags/${name}`);
}
</script>

<template>
  <div>
    <div v-if="isLoading && trendingTags.length === 0" class="space-y-3 p-4">
      <Skeleton v-for="i in 8" :key="i" class="h-10 w-full" />
    </div>
    <TagList
      v-else
      :tags="trendingTags"
      class="py-2"
      @tag-click="handleTagClick"
    />
  </div>
</template>
