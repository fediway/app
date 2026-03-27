<script setup lang="ts">
import { TagList } from '@repo/ui';
import { computed } from 'vue';

const router = useRouter();
const { exploreTabs } = useDiscoveryTabs();
const { getTrendingTags } = useExploreData();
const { data: tags } = getTrendingTags();

const trendingTags = computed(() =>
  tags.value.slice(0, 10).map(tag => ({
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
    <DiscoveryHeader
      :tabs="exploreTabs"
      @search="q => navigateTo({ path: '/search', query: { q } })"
    />

    <div class="p-4">
      <h2 class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Trending now
      </h2>
      <TagList
        :tags="trendingTags"
        @tag-click="handleTagClick"
      />
    </div>
  </div>
</template>
