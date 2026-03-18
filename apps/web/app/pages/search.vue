<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import { PhMagnifyingGlass, PhX } from '@phosphor-icons/vue';
import { AccountDisplayName, AccountHandle, Avatar, Button, Timeline } from '@repo/ui';
import { computed, ref, watch } from 'vue';
import { useData } from '~/composables/useData';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

definePageMeta({ keepalive: true });

const route = useRoute();
const router = useRouter();
const { searchStatuses, searchAccounts, searchTags, getProfileUrl } = useData();
const { toggleFollow, isFollowing } = useFollows();
const { open: openSendMessage } = useSendMessageModal();
const { open: openLightbox } = useMediaLightbox();

const searchQuery = ref((route.query.q as string) || '');
const activeTab = ref<'all' | 'posts' | 'people' | 'tags'>('all');

// Watch for query param changes
watch(() => route.query.q, (newQuery) => {
  searchQuery.value = (newQuery as string) || '';
});

// Search results
const postResults = computed(() => searchStatuses(searchQuery.value));
const accountResults = computed(() => searchAccounts(searchQuery.value));
const tagResults = computed(() => searchTags(searchQuery.value));

const hasResults = computed(() =>
  postResults.value.length > 0
  || accountResults.value.length > 0
  || tagResults.value.length > 0,
);

const isSearching = computed(() => searchQuery.value.trim().length > 0);

// Filtered results based on active tab
const filteredPosts = computed(() => {
  if (activeTab.value === 'people' || activeTab.value === 'tags')
    return [];
  return activeTab.value === 'all' ? postResults.value.slice(0, 5) : postResults.value;
});

const filteredAccounts = computed(() => {
  if (activeTab.value === 'posts' || activeTab.value === 'tags')
    return [];
  return activeTab.value === 'all' ? accountResults.value.slice(0, 3) : accountResults.value;
});

const filteredTags = computed(() => {
  if (activeTab.value === 'posts' || activeTab.value === 'people')
    return [];
  return activeTab.value === 'all' ? tagResults.value.slice(0, 5) : tagResults.value;
});

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } });
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    handleSearch();
  }
}

function clearSearch() {
  searchQuery.value = '';
  router.push('/search');
}

function handleStatusClick(statusId: string) {
  navigateTo(`/status/${statusId}`);
}

function handleProfileClick(acct: string) {
  navigateTo(getProfileUrl(acct));
}

function handleTagClick(tag: Tag) {
  navigateTo(`/tags/${tag.name}`);
}

function handleSendMessage(status: Status) {
  openSendMessage(status);
}

function handleMediaClick(attachments: MediaAttachment[], index: number) {
  openLightbox(attachments, index);
}

const tabs = computed(() => [
  { value: 'all' as const, label: 'All', count: null },
  { value: 'posts' as const, label: 'Posts', count: postResults.value.length },
  { value: 'people' as const, label: 'People', count: accountResults.value.length },
  { value: 'tags' as const, label: 'Tags', count: tagResults.value.length },
]);
</script>

<template>
  <div class="w-full">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
      <h1 class="text-xl font-bold mb-3">
        Search
      </h1>

      <!-- Search Input -->
      <div class="relative">
        <PhMagnifyingGlass :size="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search posts, people, and tags..."
          class="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-full text-[15px] outline-hidden focus:ring-2 focus:ring-gray-300 focus:bg-white transition-colors"
          @keydown="handleKeydown"
        >
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          @click="clearSearch"
        >
          <PhX :size="20" />
        </button>
      </div>

      <!-- Tabs -->
      <nav v-if="isSearching" class="flex gap-1 mt-3">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="px-4 py-2 rounded-full text-sm font-medium transition-colors" :class="[
            activeTab === tab.value
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          ]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span v-if="tab.count !== null" class="ml-1 text-xs opacity-75">
            ({{ tab.count }})
          </span>
        </button>
      </nav>
    </div>

    <!-- Empty State (no query) -->
    <div v-if="!isSearching" class="text-center py-16 px-4">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <PhMagnifyingGlass :size="32" class="text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        Search Fediway
      </h3>
      <p class="text-gray-500">
        Find posts, people, and tags
      </p>
    </div>

    <!-- No Results -->
    <div v-else-if="!hasResults" class="text-center py-16 px-4">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <PhMagnifyingGlass :size="32" class="text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        No results found
      </h3>
      <p class="text-gray-500">
        Try searching for something else
      </p>
    </div>

    <!-- Search Results -->
    <div v-else>
      <!-- People Section -->
      <div v-if="filteredAccounts.length > 0">
        <div class="px-4 py-2 bg-gray-50 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-500">People</span>
        </div>
        <div class="divide-y divide-gray-100">
          <NuxtLink
            v-for="account in filteredAccounts"
            :key="account.id"
            :to="getProfileUrl(account.acct)"
            class="block px-4 py-3 hover:bg-gray-50 transition-colors no-underline"
          >
            <div class="flex items-center gap-3">
              <Avatar :src="account.avatar" :alt="account.displayName" size="md" class="shrink-0" />
              <div class="flex-1 min-w-0">
                <AccountDisplayName
                  :name="account.displayName || account.username"
                  :emojis="account.emojis"
                  class="truncate block"
                />
                <AccountHandle :acct="account.acct" class="text-sm truncate block" />
              </div>
              <Button
                size="sm"
                class="bg-white text-gray-900 border border-gray-300 hover:bg-gray-50" :class="[
                  isFollowing(account.id)
                    ? 'text-gray-700 hover:border-red-300 hover:text-red-600 hover:bg-white'
                    : '',
                ]"
                @click.prevent.stop="toggleFollow(account.id)"
              >
                {{ isFollowing(account.id) ? 'Following' : 'Follow' }}
              </Button>
            </div>
          </NuxtLink>
        </div>
        <button
          v-if="activeTab === 'all' && accountResults.length > 3"
          type="button"
          class="w-full px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors text-left"
          @click="activeTab = 'people'"
        >
          See all {{ accountResults.length }} people
        </button>
      </div>

      <!-- Tags Section -->
      <div v-if="filteredTags.length > 0">
        <div class="px-4 py-2 bg-gray-50 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-500">Tags</span>
        </div>
        <div class="divide-y divide-gray-100">
          <NuxtLink
            v-for="tag in filteredTags"
            :key="tag.id"
            :to="`/tags/${tag.name}`"
            class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors no-underline"
          >
            <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <span class="text-lg text-gray-500">#</span>
            </div>
            <span class="font-medium text-gray-900">#{{ tag.name }}</span>
          </NuxtLink>
        </div>
        <button
          v-if="activeTab === 'all' && tagResults.length > 5"
          type="button"
          class="w-full px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors text-left"
          @click="activeTab = 'tags'"
        >
          See all {{ tagResults.length }} tags
        </button>
      </div>

      <!-- Posts Section -->
      <div v-if="filteredPosts.length > 0">
        <div class="px-4 py-2 bg-gray-50 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-500">Posts</span>
        </div>
        <Timeline
          :statuses="filteredPosts"
          :get-profile-url="getProfileUrl"
          @status-click="handleStatusClick"
          @profile-click="handleProfileClick"
          @tag-click="handleTagClick"
          @send-message="handleSendMessage"
          @media-click="handleMediaClick"
        />
        <button
          v-if="activeTab === 'all' && postResults.length > 5"
          type="button"
          class="w-full px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
          @click="activeTab = 'posts'"
        >
          See all {{ postResults.length }} posts
        </button>
      </div>
    </div>
  </div>
</template>
