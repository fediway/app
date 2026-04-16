<script setup lang="ts">
import type { Item, MediaAttachment, Status } from '@repo/types';
import type { AccountListUser } from '@repo/ui';
import type { Ref } from 'vue';
import { previewCardToItem, useItemStore } from '@repo/api';
import {
  AccountList,
  Avatar,
  EmptyState,
  FollowButton,
  ItemCard,
  Section,
  Skeleton,
  Timeline,
} from '@repo/ui';
import { ref, shallowRef, watch, watchEffect } from 'vue';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

const route = useRoute();
const router = useRouter();

usePageHeader({ title: 'Search' });
const { searchStatuses, searchAccounts, searchTags } = useSearchData();
const { getProfilePath, getStatusPath, getSuggestedAccounts } = useAccountData();
const { toggleFollow, isFollowing, hasRelationship, getRelationship, fetchRelationships } = useFollows();
const { open: openSendMessage } = useSendMessageModal();
const { open: openLightbox } = useMediaLightbox();

const searchQuery = ref((route.query.q as string) || '');
const activeTab = ref('everything');

const searchTabs = [
  { label: 'Everything', value: 'everything' },
  { label: 'Users', value: 'users' },
  { label: 'Posts', value: 'posts' },
  { label: 'Links', value: 'links' },
];

// Sync query param → searchQuery
watch(() => route.query.q, (newQuery) => {
  searchQuery.value = (newQuery as string) || '';
});

// Search results — createQuery returns stable refs for the same key,
// but must not be called inside computed (triggers SWR revalidation on every access).
// Instead, call once per query change and read the returned refs.
const postResults = shallowRef<Status[]>([]);
const accountResults = shallowRef<any[]>([]);
const tagResults = shallowRef<any[]>([]);
const isSearchLoading = ref(false);

const queryRefs = shallowRef<{
  posts: Ref<Status[]>;
  accounts: Ref<any[]>;
  tags: Ref<any[]>;
  postsLoading: Ref<boolean>;
  accountsLoading: Ref<boolean>;
  tagsLoading: Ref<boolean>;
} | null>(null);

watch(searchQuery, (query) => {
  if (!query.trim()) {
    postResults.value = [];
    accountResults.value = [];
    tagResults.value = [];
    isSearchLoading.value = false;
    queryRefs.value = null;
    activeTab.value = 'everything';
    return;
  }
  const posts = searchStatuses(query);
  const accounts = searchAccounts(query);
  const tags = searchTags(query);
  queryRefs.value = { posts: posts.data, accounts: accounts.data, tags: tags.data, postsLoading: posts.isLoading, accountsLoading: accounts.isLoading, tagsLoading: tags.isLoading };
}, { immediate: true });

watchEffect(() => {
  const refs = queryRefs.value;
  if (refs) {
    postResults.value = refs.posts.value;
    accountResults.value = refs.accounts.value;
    tagResults.value = refs.tags.value;
    isSearchLoading.value = refs.postsLoading.value || refs.accountsLoading.value || refs.tagsLoading.value;
  }
});

const isSearching = computed(() => searchQuery.value.trim().length > 0);
const hasResults = computed(() =>
  postResults.value.length > 0
  || accountResults.value.length > 0
  || tagResults.value.length > 0,
);

// Batch-fetch relationships when account results change
watch(accountResults, (accts) => {
  if (accts.length > 0) {
    fetchRelationships(accts.map(a => a.id));
  }
});

// Filtered results based on active tab
const filteredPosts = computed(() => {
  if (activeTab.value === 'users' || activeTab.value === 'links')
    return [];
  return activeTab.value === 'everything' ? postResults.value.slice(0, 5) : postResults.value;
});

const filteredAccounts = computed(() => {
  if (activeTab.value === 'posts' || activeTab.value === 'links')
    return [];
  return activeTab.value === 'everything' ? accountResults.value.slice(0, 3) : accountResults.value;
});

// Suggested accounts for discover state
const { data: suggestedAccountsData } = getSuggestedAccounts();
const suggestions = computed<AccountListUser[]>(() =>
  suggestedAccountsData.value.slice(0, 3).map(account => ({
    displayName: account.displayName || account.username,
    handle: `@${account.acct}`,
    avatarSrc: account.avatar,
  })),
);

// Trending data for discover state
const { getTrendingLinks, getTrendingTags } = useExploreData();
const { data: trendingLinksData } = getTrendingLinks();
const itemStore = useItemStore();
const trendingItems = computed<Item[]>(() =>
  trendingLinksData.value.slice(0, 3).map(link => previewCardToItem(link)),
);

// Seed item store so link pages render instantly
watch(trendingItems, (items) => {
  if (items.length)
    itemStore.setMany(items);
}, { immediate: true });

// Trending tags for discover state
const { data: trendingTagsData } = getTrendingTags();
const trendingTags = computed(() =>
  trendingTagsData.value.slice(0, 5).map(tag => ({
    name: tag.name,
    posts: tag.history?.[0]?.uses ? Number(tag.history[0].uses) : 0,
  })),
);

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } });
  }
}

function handleStatusClick(statusId: string) {
  navigateTo(getStatusPath(statusId));
}

function handleProfileClick(acct: string) {
  navigateTo(getProfilePath(acct));
}

function handleTagClick(tag: string) {
  navigateTo(`/tags/${tag}`);
}

function handleSendMessage(status: Status) {
  openSendMessage(status);
}

function handleMediaClick(attachments: MediaAttachment[], index: number) {
  openLightbox(attachments, index);
}
</script>

<template>
  <div class="w-full">
    <DiscoveryHeader
      v-model:search="searchQuery"
      v-model:tab="activeTab"
      :tabs="isSearching ? searchTabs : []"
      search-placeholder="Search"
      @search="handleSearch"
    />

    <ClientOnly>
      <!-- Discover State (no search query) -->
      <template v-if="!isSearching">
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

        <!-- Trending Links -->
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
      </template>

      <!-- Loading -->
      <div v-else-if="isSearchLoading && !hasResults" class="space-y-4 p-5">
        <Skeleton class="h-12 w-full" />
        <Skeleton class="h-12 w-full" />
        <Skeleton class="h-12 w-full" />
      </div>

      <!-- No Results -->
      <EmptyState
        v-else-if="!hasResults"
        title="No results found"
        description="Try searching for something else"
        class="py-16"
      />

      <!-- Search Results -->
      <div v-else>
        <!-- People Section -->
        <div v-if="filteredAccounts.length > 0">
          <Section
            title="People"
            :show-action="activeTab === 'everything' && accountResults.length > 3"
            action-label="View all"
            class="mt-3"
            @action="activeTab = 'users'"
          >
            <NuxtLink
              v-for="account in filteredAccounts"
              :key="account.id"
              :to="getProfilePath(account.acct)"
              class="flex items-center gap-3 px-5 py-3 no-underline transition-colors hover:bg-muted/50"
            >
              <Avatar :src="account.avatar" :alt="account.displayName" size="md" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-base font-bold text-foreground">
                  {{ account.displayName || account.username }}
                </p>
                <p class="truncate text-sm text-muted-foreground">
                  @{{ account.acct }}
                </p>
              </div>
              <FollowButton
                v-if="hasRelationship(account.id)"
                :is-following="isFollowing(account.id)"
                :requested="getRelationship(account.id).requested"
                size="sm"
                @click.prevent.stop
                @follow="toggleFollow(account.id)"
                @unfollow="toggleFollow(account.id)"
              />
            </NuxtLink>
          </Section>
        </div>

        <!-- Posts Section -->
        <div v-if="filteredPosts.length > 0">
          <Section
            title="Posts"
            :show-action="activeTab === 'everything' && postResults.length > 5"
            action-label="View all"
            class="mt-3"
            @action="activeTab = 'posts'"
          >
            <Timeline
              :statuses="filteredPosts"
              :get-profile-url="getProfilePath"
              @status-click="handleStatusClick"
              @profile-click="handleProfileClick"
              @tag-click="handleTagClick"
              @send-message="handleSendMessage"
              @media-click="handleMediaClick"
            />
          </Section>
        </div>
      </div>

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
