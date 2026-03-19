<script setup lang="ts">
import type { Account, Status, Tag } from '@repo/types';
import { useClient } from '@repo/api';
import { AccountCard, EmptyState, ListHeader, SearchInput, Status as StatusComponent, TabBar, TagListItem } from '@repo/ui';
import { computed, onUnmounted, ref, shallowRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getProfileUrl, useStatusBridge } from '../composables/useStatusBridge';

defineOptions({ name: 'SearchPage' });

const router = useRouter();

type SearchTab = 'all' | 'people' | 'posts' | 'tags';

const query = ref('');
const activeTab = ref<SearchTab>('all');
const debouncedQuery = ref('');
const loading = ref(false);

const searchedAccounts = shallowRef<Account[]>([]);
const searchedStatuses = shallowRef<Status[]>([]);
const searchedTags = shallowRef<Tag[]>([]);
const trendingTags = shallowRef<Tag[]>([]);

const { statuses: displayStatuses, toggleFavourite, toggleReblog, toggleBookmark } = useStatusBridge(searchedStatuses);

let debounceTimer: ReturnType<typeof setTimeout>;
watch(query, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = val;
  }, 300);
});

onUnmounted(() => {
  clearTimeout(debounceTimer);
});

function getClient() {
  try {
    return useClient();
  }
  catch {
    return null;
  }
}

watch(debouncedQuery, async (val) => {
  if (!val.trim()) {
    searchedAccounts.value = [];
    searchedStatuses.value = [];
    searchedTags.value = [];
    return;
  }

  const client = getClient();
  if (!client)
    return;

  loading.value = true;
  try {
    const result = await client.rest.v2.search.list({ q: val, limit: 20 });
    searchedAccounts.value = result.accounts;
    searchedStatuses.value = result.statuses;
    searchedTags.value = result.hashtags;
  }
  catch {
    // Search errors are silent
  }
  finally {
    loading.value = false;
  }
});

async function loadTrending() {
  const client = getClient();
  if (!client)
    return;
  try {
    trendingTags.value = await client.rest.v1.trends.tags.list({ limit: 10 });
  }
  catch {
    // Silent
  }
}

loadTrending();

const searchTabs = [
  { label: 'All', value: 'all' },
  { label: 'People', value: 'people' },
  { label: 'Posts', value: 'posts' },
  { label: 'Tags', value: 'tags' },
];

const showPeople = computed(() => activeTab.value === 'all' || activeTab.value === 'people');
const showPosts = computed(() => activeTab.value === 'all' || activeTab.value === 'posts');
const showTags = computed(() => activeTab.value === 'all' || activeTab.value === 'tags');

const hasResults = computed(() =>
  searchedAccounts.value.length > 0 || displayStatuses.value.length > 0 || searchedTags.value.length > 0,
);

function handleStatusClick(id: string) {
  router.push(`/status/${id}`);
}

function handleProfileClick(acct: string) {
  router.push(getProfileUrl(acct));
}

function handleTagClick(tagOrName: Tag | string) {
  const name = typeof tagOrName === 'string' ? tagOrName : tagOrName.name;
  router.push(`/tags/${encodeURIComponent(name)}`);
}
</script>

<template>
  <div class="flex flex-col">
    <!-- Search input -->
    <div class="sticky top-[calc(3.5rem+var(--safe-area-inset-top))] z-10 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
      <SearchInput
        v-model="query"
        placeholder="Search..."
        class="w-full"
      />
    </div>

    <!-- Results -->
    <template v-if="debouncedQuery">
      <!-- Tabs -->
      <TabBar v-model="activeTab" :tabs="searchTabs" />

      <div class="divide-y divide-gray-200 dark:divide-gray-800">
        <!-- People -->
        <div v-if="showPeople && searchedAccounts.length > 0" class="px-4 py-3">
          <ListHeader v-if="activeTab === 'all'" title="People" class="mb-3" />
          <div class="space-y-3">
            <div v-for="account in searchedAccounts" :key="account.id" @click="handleProfileClick(account.acct)">
              <AccountCard :account="account" :profile-url="getProfileUrl(account.acct)" show-bio size="sm" />
            </div>
          </div>
        </div>

        <!-- Posts -->
        <div v-if="showPosts && displayStatuses.length > 0">
          <ListHeader v-if="activeTab === 'all'" title="Posts" class="px-4 pt-3" />
          <div v-for="status in displayStatuses" :key="status.id">
            <StatusComponent
              :status="status"
              :profile-url="getProfileUrl(status.account.acct)"
              @favourite="toggleFavourite(status.reblog?.id ?? status.id)"
              @reblog="toggleReblog(status.reblog?.id ?? status.id)"
              @bookmark="toggleBookmark(status.reblog?.id ?? status.id)"
              @status-click="handleStatusClick"
              @profile-click="handleProfileClick"
              @tag-click="handleTagClick"
            />
          </div>
        </div>

        <!-- Tags -->
        <div v-if="showTags && searchedTags.length > 0" class="px-4 py-3">
          <ListHeader v-if="activeTab === 'all'" title="Tags" class="mb-3" />
          <div class="space-y-1">
            <TagListItem
              v-for="tag in searchedTags"
              :key="tag.name"
              :name="tag.name"
              @click="handleTagClick(tag.name)"
            />
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Searching...
        </p>
      </div>

      <!-- Empty -->
      <EmptyState
        v-else-if="!hasResults"
        title="No results found"
        description="Try a different search term"
      />
    </template>

    <!-- Trending tags (no query) -->
    <div v-else class="px-4 py-3">
      <ListHeader title="Trending" class="mb-3" />
      <div class="space-y-1">
        <TagListItem
          v-for="tag in trendingTags"
          :key="tag.name"
          :name="tag.name"
          @click="handleTagClick(tag.name)"
        />
      </div>
    </div>
  </div>
</template>
