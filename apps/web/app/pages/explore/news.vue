<script setup lang="ts">
import { previewCardToItem, useItemStore } from '@repo/api';
import { EmptyState, ItemCard, Skeleton } from '@repo/ui';
import { computed, watch } from 'vue';

const { getTrendingLinks } = useExploreData();
const { data: links, isLoading, error, refetch } = getTrendingLinks();
const itemStore = useItemStore();

const trendingItems = computed(() =>
  links.value.map(link => previewCardToItem(link)),
);

// Seed item store so link pages render instantly
watch(trendingItems, (items) => {
  if (items.length)
    itemStore.setMany(items);
}, { immediate: true });

function getLinkPageUrl(url: string): string {
  return `/links/${encodeURIComponent(url)}`;
}
</script>

<template>
  <div>
    <ClientOnly>
      <EmptyState
        v-if="error"
        :title="error.message || 'Failed to load news'"
        action-label="Try again"
        class="py-12"
        @action="refetch()"
      />

      <EmptyState
        v-else-if="!isLoading && trendingItems.length === 0"
        title="No trending news"
        description="Check back later for trending links."
        class="py-12"
      />

      <div v-else-if="trendingItems.length > 0">
        <NuxtLink
          v-for="item in trendingItems"
          :key="item.url"
          :to="getLinkPageUrl(item.url)"
          class="block px-5 py-3 no-underline transition-colors hover:bg-muted/50"
        >
          <ItemCard :item="item" />
        </NuxtLink>
      </div>

      <template #fallback>
        <div class="space-y-4 p-4">
          <div v-for="i in 5" :key="i" class="flex items-start gap-3">
            <Skeleton class="h-12 w-12 rounded-sm" />
            <div class="flex-1 space-y-2">
              <Skeleton class="h-4 w-3/4" />
              <Skeleton class="h-3 w-24" />
            </div>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
