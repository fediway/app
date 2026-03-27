<script setup lang="ts">
import type { MediaAttachment, Status } from '@repo/types';
import type { AccountListUser } from '@repo/ui';
import type { Ref } from 'vue';
import {
  AccountList,
  Avatar,
  EmptyState,
  FollowButton,
  Section,
  Skeleton,
  Timeline,
} from '@repo/ui';
import { ref, shallowRef, watch, watchEffect } from 'vue';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

definePageMeta({});

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
  { label: 'Items', value: 'items' },
  { label: 'Users', value: 'users' },
  { label: 'Posts', value: 'posts' },
  { label: 'Takes', value: 'takes' },
];

// Watch for query param changes
watch(() => route.query.q, (newQuery) => {
  searchQuery.value = (newQuery as string) || '';
});

// Search results — createQuery returns stable refs for the same key,
// but must not be called inside computed (triggers SWR revalidation on every access).
// Instead, call once per query change and read the returned refs.
const postResults = shallowRef<Status[]>([]);
const accountResults = shallowRef<any[]>([]);
const tagResults = shallowRef<any[]>([]);

let currentQueryRefs: { posts: Ref<Status[]>; accounts: Ref<any[]>; tags: Ref<any[]> } | null = null;

watch(searchQuery, (query) => {
  if (!query.trim()) {
    postResults.value = [];
    accountResults.value = [];
    tagResults.value = [];
    currentQueryRefs = null;
    return;
  }
  const posts = searchStatuses(query);
  const accounts = searchAccounts(query);
  const tags = searchTags(query);
  currentQueryRefs = { posts: posts.data, accounts: accounts.data, tags: tags.data };
}, { immediate: true });

// Sync the query result refs into our local refs (reactive bridge)
watchEffect(() => {
  if (currentQueryRefs) {
    postResults.value = currentQueryRefs.posts.value;
    accountResults.value = currentQueryRefs.accounts.value;
    tagResults.value = currentQueryRefs.tags.value;
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
  if (activeTab.value === 'users' || activeTab.value === 'items')
    return [];
  return activeTab.value === 'everything' ? postResults.value.slice(0, 5) : postResults.value;
});

const filteredAccounts = computed(() => {
  if (activeTab.value === 'posts' || activeTab.value === 'items' || activeTab.value === 'takes')
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
      :tabs="searchTabs"
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
        >
          <AccountList :users="suggestions" />
        </Section>
      </template>

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
          <Section title="People" class="mt-3">
            <div class="divide-y divide-border">
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
                  @follow.prevent.stop="toggleFollow(account.id)"
                  @unfollow.prevent.stop="toggleFollow(account.id)"
                />
              </NuxtLink>
            </div>
          </Section>
        </div>

        <!-- Posts Section -->
        <div v-if="filteredPosts.length > 0">
          <div class="px-5 py-2">
            <h2 class="text-lg font-bold text-foreground">
              Posts
            </h2>
          </div>
          <Timeline
            :statuses="filteredPosts"
            :get-profile-url="getProfilePath"
            @status-click="handleStatusClick"
            @profile-click="handleProfileClick"
            @tag-click="handleTagClick"
            @send-message="handleSendMessage"
            @media-click="handleMediaClick"
          />
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
