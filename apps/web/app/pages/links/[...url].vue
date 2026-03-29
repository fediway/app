<script setup lang="ts">
import type { Item } from '@repo/types';
import { previewCardToItem, useItemStore } from '@repo/api';
import { ItemPage, Skeleton } from '@repo/ui';
import { computed } from 'vue';

const route = useRoute();
const router = useRouter();
const { getStatusesByLink, getLinkInfo } = useExploreData();
const { handleShare } = useWebActions();
const itemStore = useItemStore();

const linkUrl = computed(() => {
  const url = route.params.url;
  return Array.isArray(url) ? url.join('/') : url;
});

const linkInfo = computed(() => getLinkInfo(linkUrl.value || ''));
const { data: rawStatuses, isLoading } = getStatusesByLink(linkUrl.value || '');

const allStatuses = useWebActions().withStoreState(rawStatuses);

// Filter out posts with no meaningful content (just the link + maybe hashtags)
const HTML_TAG_RE = /<[^>]*>/g;
const HASHTAG_RE = /#\w+/g;
const URL_RE = /https?:\/\/\S+/g;

const statuses = computed(() =>
  allStatuses.value.filter((s) => {
    const text = (s.reblog?.content ?? s.content)
      .replace(HTML_TAG_RE, ' ')
      .replace(URL_RE, '')
      .replace(HASHTAG_RE, '')
      .trim();
    return text.length > 0;
  }),
);

// Item: read from store first (instant if seeded by explore/search),
// fall back to API-derived data, then skeleton if nothing available
const item = computed<Item | null>(() => {
  // 1. Store has it (seeded by explore/news or search)
  const cached = itemStore.get(linkUrl.value || '');
  if (cached)
    return cached;

  // 2. API response has it (after statusesByLink fetch)
  if (linkInfo.value) {
    const fresh = previewCardToItem(linkInfo.value);
    itemStore.set(fresh); // seed for future navigations
    return fresh;
  }

  return null;
});

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  }
  catch {
    return 'Link';
  }
}

usePageHeader({
  title: computed(() => getDomain(linkUrl.value || '')),
  subtitle: computed(() => statuses.value.length ? `${statuses.value.length} posts` : undefined),
});

function handleVisit() {
  if (linkUrl.value) {
    window.open(linkUrl.value, '_blank', 'noopener,noreferrer');
  }
}

function handleShareLink() {
  // Use the first status ID if available for share context, otherwise share the raw URL
  if (statuses.value.length > 0) {
    handleShare(statuses.value[0].id);
  }
  else if (linkUrl.value) {
    if (navigator.share) {
      navigator.share({ url: linkUrl.value, title: item.value?.title });
    }
    else {
      navigator.clipboard.writeText(linkUrl.value);
    }
  }
}

function handleBack() {
  if (window.history.length > 1) {
    router.back();
  }
  else {
    router.push('/explore/news');
  }
}
</script>

<template>
  <div class="w-full">
    <ItemPage
      v-if="item"
      :item="item"
      @visit="handleVisit"
      @share="handleShareLink"
      @back="handleBack"
    >
      <StatusTimeline
        :statuses="statuses"
        :is-loading="isLoading"
        hide-cards
        empty-title="No posts yet"
        empty-description="No one has shared this link yet"
      />
    </ItemPage>

    <!-- Loading skeleton while item data loads -->
    <div v-else class="flex flex-col">
      <!-- Hero skeleton -->
      <div class="px-4 pt-4">
        <Skeleton class="h-40 w-full rounded-lg" />
      </div>
      <!-- Badge + domain skeleton -->
      <div class="flex items-center gap-2 px-4 mt-3">
        <Skeleton class="h-6 w-16 rounded-full" />
        <Skeleton class="h-4 w-28" />
      </div>
      <!-- Title skeleton -->
      <Skeleton class="mx-4 mt-2 h-6 w-3/4" />
      <!-- Description skeleton -->
      <Skeleton class="mx-4 mt-1.5 h-4 w-full" />
      <Skeleton class="mx-4 mt-1 h-4 w-2/3" />
      <!-- Actions skeleton -->
      <div class="flex items-center gap-3 px-4 mt-4 pb-4 border-b border-border">
        <Skeleton class="h-11 flex-1 rounded-full" />
        <Skeleton class="size-11 rounded-full" />
      </div>
    </div>
  </div>
</template>
