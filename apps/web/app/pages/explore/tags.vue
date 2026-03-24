<script setup lang="ts">
import { TagList } from '@repo/ui';
import { computed } from 'vue';

const router = useRouter();
const { exploreTabs } = useDiscoveryTabs();
const { getTrendingTags } = useExploreData();
const { data: tags } = getTrendingTags();

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
  <div class="w-full">
    <DiscoveryHeader
      :tabs="exploreTabs"
      @search="q => navigateTo({ path: '/search', query: { q } })"
    />

    <TagList
      :tags="trendingTags"
      @tag-click="handleTagClick"
    />
  </div>
</template>
