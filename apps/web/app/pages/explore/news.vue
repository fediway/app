<script setup lang="ts">
import { EmptyState, Skeleton } from '@repo/ui';
import { computed } from 'vue';

const { exploreTabs } = useDiscoveryTabs();
const { getTrendingLinks } = useExploreData();
const { data: links, isLoading, error, refetch } = getTrendingLinks();

const trendingLinks = computed(() =>
  links.value.map(link => ({
    url: link.url,
    title: link.title,
    description: link.description,
    image: link.image ?? undefined,
    source: link.providerName || new URL(link.url).hostname.replace('www.', ''),
    posts: link.history?.[0]?.uses ? `${Number(link.history[0].uses).toLocaleString()} posts` : undefined,
  })),
);

function getLinkPageUrl(url: string): string {
  return `/links/${encodeURIComponent(url)}`;
}
</script>

<template>
  <div class="w-full">
    <DiscoveryHeader
      :tabs="exploreTabs"
      @search="q => navigateTo({ path: '/search', query: { q } })"
    />

    <ClientOnly>
      <EmptyState
        v-if="error"
        :title="error.message || 'Failed to load news'"
        action-label="Try again"
        class="py-12"
        @action="refetch()"
      />

      <EmptyState
        v-else-if="!isLoading && trendingLinks.length === 0"
        title="No trending news"
        description="Check back later for trending links."
        class="py-12"
      />

      <div v-else-if="trendingLinks.length > 0" class="divide-y divide-border">
        <NuxtLink
          v-for="link in trendingLinks"
          :key="link.url"
          :to="getLinkPageUrl(link.url)"
          class="block px-4 py-4 no-underline transition-colors hover:bg-muted/50"
        >
          <div class="flex items-start gap-3">
            <div
              v-if="link.image"
              class="size-16 shrink-0 overflow-hidden rounded-lg bg-muted"
            >
              <img
                :src="link.image"
                :alt="link.title"
                class="size-full object-cover"
              >
            </div>
            <div class="min-w-0 flex-1">
              <div class="mb-1 text-base font-medium leading-snug text-foreground">
                {{ link.title }}
              </div>
              <p class="mb-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                {{ link.description }}
              </p>
              <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span>{{ link.source }}</span>
                <span v-if="link.posts">{{ link.posts }}</span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <template #fallback>
        <div class="space-y-4 p-4">
          <div v-for="i in 5" :key="i" class="flex items-start gap-3">
            <Skeleton class="size-16 rounded-lg" />
            <div class="flex-1 space-y-2">
              <Skeleton class="h-4 w-3/4" />
              <Skeleton class="h-3 w-full" />
              <Skeleton class="h-3 w-24" />
            </div>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
