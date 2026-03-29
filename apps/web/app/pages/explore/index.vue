<script setup lang="ts">
import type { Item } from '@repo/types';
import type { AccountListUser } from '@repo/ui';
import { previewCardToItem, useItemStore } from '@repo/api';
import { AccountList, ItemCard, Section, Skeleton } from '@repo/ui';
import { computed, watch } from 'vue';

const { getProfilePath, getSuggestedAccounts } = useAccountData();
const { getTrendingLinks, getTrendingTags } = useExploreData();
const itemStore = useItemStore();

// User suggestions
const { data: suggestedAccountsData } = getSuggestedAccounts();
const suggestions = computed<AccountListUser[]>(() =>
  suggestedAccountsData.value.slice(0, 3).map(account => ({
    displayName: account.displayName || account.username,
    handle: `@${account.acct}`,
    avatarSrc: account.avatar,
  })),
);

// Trending news
const { data: trendingLinksData } = getTrendingLinks();
const trendingItems = computed<Item[]>(() =>
  trendingLinksData.value.slice(0, 3).map(link => previewCardToItem(link)),
);

watch(trendingItems, (items) => {
  if (items.length)
    itemStore.setMany(items);
}, { immediate: true });

// Trending tags
const { data: trendingTagsData } = getTrendingTags();
const trendingTags = computed(() =>
  trendingTagsData.value.slice(0, 5).map(tag => ({
    name: tag.name,
    posts: tag.history?.[0]?.uses ? Number(tag.history[0].uses) : 0,
  })),
);
</script>

<template>
  <div>
    <ClientOnly>
      <!-- User Suggestions -->
      <Section
        title="User Suggestions"
        show-action
        action-label="View all"
        class="mt-3"
        @action="navigateTo('/explore/people')"
      >
        <AccountList
          :users="suggestions"
          @user-click="(handle) => navigateTo(getProfilePath(handle.replace(/^@/, '')))"
        />
      </Section>

      <!-- Trending News -->
      <Section
        v-if="trendingItems.length > 0"
        title="Trending News"
        show-action
        action-label="View all"
        class="mt-3"
        @action="navigateTo('/explore/news')"
      >
        <NuxtLink
          v-for="item in trendingItems"
          :key="item.url"
          :to="`/links/${encodeURIComponent(item.url)}`"
          class="block px-5 py-3 no-underline transition-colors hover:bg-muted/50"
        >
          <ItemCard :item="item" />
        </NuxtLink>
      </Section>

      <!-- Trending Tags -->
      <Section
        v-if="trendingTags.length > 0"
        title="Trending Tags"
        show-action
        action-label="View all"
        class="mt-3"
        @action="navigateTo('/explore/tags')"
      >
        <div class="flex flex-wrap gap-2 px-5">
          <NuxtLink
            v-for="tag in trendingTags"
            :key="tag.name"
            :to="`/tags/${tag.name}`"
            class="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-foreground no-underline transition-colors hover:bg-muted/70"
          >
            <span class="text-muted-foreground">#</span>{{ tag.name }}
            <span v-if="tag.posts" class="text-xs text-muted-foreground">{{ tag.posts.toLocaleString() }}</span>
          </NuxtLink>
        </div>
      </Section>

      <template #fallback>
        <div class="space-y-4 p-5">
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
