<script setup lang="ts">
import { TagList } from '@repo/ui';
import { computed } from 'vue';

const router = useRouter();
const { getTrendingTags, getStatusesByTag } = useExploreData();
const { data: tags } = getTrendingTags();

const trendingTags = computed(() =>
  tags.value.map(tag => ({
    name: tag.name,
    postCount: getStatusesByTag(tag.name).data.value.length,
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
