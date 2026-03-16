<script setup lang="ts">
import { AccountCard, Status } from '@repo/ui';
import Input from '@ui/components/ui/input/Input.vue';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useData } from '../composables/useData';
import { useInteractions } from '../composables/useInteractions';

defineOptions({ name: 'SearchPage' });

const router = useRouter();
const { searchAccounts, searchStatuses, searchTags, getTrendingTags, getProfileUrl } = useData();
const { toggleFavourite, toggleReblog, toggleBookmark, withOverridesAll } = useInteractions();

type SearchTab = 'all' | 'people' | 'posts' | 'tags';

const query = ref('');
const activeTab = ref<SearchTab>('all');
const debouncedQuery = ref('');

let debounceTimer: ReturnType<typeof setTimeout>;
watch(query, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = val;
  }, 300);
});

const tabs: { id: SearchTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'people', label: 'People' },
  { id: 'posts', label: 'Posts' },
  { id: 'tags', label: 'Tags' },
];

function accounts() {
  return debouncedQuery.value ? searchAccounts(debouncedQuery.value) : [];
}

function statuses() {
  return debouncedQuery.value ? withOverridesAll(searchStatuses(debouncedQuery.value)) : [];
}

function tags() {
  return debouncedQuery.value ? searchTags(debouncedQuery.value) : [];
}

function trendingTags() {
  return getTrendingTags();
}

function handleStatusClick(id: string) {
  router.push(`/status/${id}`);
}

function handleProfileClick(acct: string) {
  router.push(getProfileUrl(acct));
}

function handleTagClick(tag: string) {
  router.push(`/tags/${encodeURIComponent(tag)}`);
}

function handleFavourite(id: string) {
  toggleFavourite(id, statuses());
}

function handleReblog(id: string) {
  toggleReblog(id, statuses());
}

function handleBookmark(id: string) {
  toggleBookmark(id, statuses());
}
</script>

<template>
  <div class="flex flex-col">
    <!-- Search input -->
    <div class="sticky top-[calc(3.5rem+var(--safe-area-inset-top))] z-10 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
      <Input
        v-model="query"
        type="search"
        placeholder="Search..."
        class="w-full"
      />
    </div>

    <!-- Tabs -->
    <div v-if="debouncedQuery" class="flex border-b border-gray-200 dark:border-gray-800">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="flex-1 py-3 text-center text-sm font-medium transition-colors"
        :class="activeTab === tab.id
          ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
          : 'text-gray-500 dark:text-gray-400'"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Results -->
    <div v-if="debouncedQuery" class="divide-y divide-gray-200 dark:divide-gray-800">
      <!-- People -->
      <template v-if="activeTab === 'all' || activeTab === 'people'">
        <div v-if="accounts().length > 0" class="px-4 py-3">
          <h3 v-if="activeTab === 'all'" class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            People
          </h3>
          <div class="space-y-3">
            <div v-for="account in accounts()" :key="account.id" @click="handleProfileClick(account.acct)">
              <AccountCard :account="account" :profile-url="getProfileUrl(account.acct)" show-bio size="sm" />
            </div>
          </div>
        </div>
      </template>

      <!-- Posts -->
      <template v-if="activeTab === 'all' || activeTab === 'posts'">
        <div v-if="statuses().length > 0">
          <h3 v-if="activeTab === 'all'" class="px-4 pb-2 pt-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Posts
          </h3>
          <div v-for="status in statuses()" :key="status.id">
            <Status
              :status="status"
              :profile-url="getProfileUrl(status.account.acct)"
              @favourite="handleFavourite(status.reblog?.id ?? status.id)"
              @reblog="handleReblog(status.reblog?.id ?? status.id)"
              @bookmark="handleBookmark(status.reblog?.id ?? status.id)"
              @status-click="handleStatusClick"
              @profile-click="handleProfileClick"
              @tag-click="handleTagClick"
            />
          </div>
        </div>
      </template>

      <!-- Tags -->
      <template v-if="activeTab === 'all' || activeTab === 'tags'">
        <div v-if="tags().length > 0" class="px-4 py-3">
          <h3 v-if="activeTab === 'all'" class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Tags
          </h3>
          <div class="space-y-2">
            <button
              v-for="tag in tags()"
              :key="tag.name"
              class="block w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              @click="handleTagClick(tag.name)"
            >
              <span class="font-medium text-gray-900 dark:text-gray-100">#{{ tag.name }}</span>
            </button>
          </div>
        </div>
      </template>

      <!-- Empty state -->
      <div
        v-if="accounts().length === 0 && statuses().length === 0 && tags().length === 0"
        class="flex items-center justify-center py-20"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          No results found
        </p>
      </div>
    </div>

    <!-- Trending tags (when no search query) -->
    <div v-else class="px-4 py-3">
      <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Trending
      </h3>
      <div class="space-y-2">
        <button
          v-for="tag in trendingTags()"
          :key="tag.name"
          class="block w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          @click="handleTagClick(tag.name)"
        >
          <span class="font-medium text-gray-900 dark:text-gray-100">#{{ tag.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
