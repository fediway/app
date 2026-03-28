<script setup lang="ts">
import { Skeleton, TagList } from '@repo/ui';
import { computed } from 'vue';

const router = useRouter();
const { exploreTabs } = useDiscoveryTabs();
const { getTrendingTags } = useExploreData();
const { data: tags, isLoading } = getTrendingTags();

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
      <h2 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Trending now
      </h2>
      <div v-if="isLoading && trendingTags.length === 0" class="space-y-3">
        <Skeleton v-for="i in 5" :key="i" class="h-10 w-full" />
      </div>
      <TagList
        v-else
        :tags="trendingTags"
        @tag-click="handleTagClick"
      />
    </div>
  </div>
</template>
