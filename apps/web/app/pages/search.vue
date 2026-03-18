<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import type { UserSuggestion } from '@repo/ui';
import {
  SearchInput,
  Section,
  TabBar,
  Timeline,
  UserSuggestions,
} from '@repo/ui';
import Button from '@ui/components/ui/button/Button.vue';
import { computed, ref, watch } from 'vue';
import { useData } from '~/composables/useData';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

definePageMeta({ keepalive: true });

const route = useRoute();
const router = useRouter();
const {
  searchStatuses,
  searchAccounts,
  searchTags,
  getProfileUrl,
  getSuggestedAccounts,
} = useData();
const { toggleFollow, isFollowing } = useFollows();
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

// Search results
const postResults = computed(() => searchStatuses(searchQuery.value));
const accountResults = computed(() => searchAccounts(searchQuery.value));
const tagResults = computed(() => searchTags(searchQuery.value));

const isSearching = computed(() => searchQuery.value.trim().length > 0);
const hasResults = computed(() =>
  postResults.value.length > 0
  || accountResults.value.length > 0
  || tagResults.value.length > 0,
);

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
const suggestions = computed<UserSuggestion[]>(() =>
  getSuggestedAccounts().slice(0, 3).map(account => ({
    displayName: account.displayName || account.username,
    handle: `@${account.acct}`,
    avatarSrc: account.avatar,
  })),
);

// Mock popular items for discover state
const popularFilms = [
  { title: 'Dune: Part Two', meta: 'Denis Villeneuve, 2025 – 4.6 Stars', image: 'https://picsum.photos/seed/dune2/96/142' },
  { title: 'Pirates of the Caribbean: The Curse of the Black Pearl', meta: 'Gore Verbinski, 2003', image: 'https://picsum.photos/seed/potc/96/142' },
  { title: 'F1', meta: 'Joseph Kosinski, 2025 – 3.9 Stars', image: 'https://picsum.photos/seed/f1movie/96/142' },
];

const popularAlbums = [
  { title: 'The Mountain', meta: 'Gorillaz, 2026 – 4.1 Stars', image: 'https://picsum.photos/seed/mountain-album/96/96', square: true },
  { title: 'The Romantic', meta: 'Bruno Mars, 2026 – 3.9 Stars', image: 'https://picsum.photos/seed/romantic-album/96/96', square: true },
  { title: 'Nothing\'s About to Happen to Me', meta: 'Mitski, 2026 – 4.4 Stars', image: 'https://picsum.photos/seed/mitski-album/96/96', square: true },
];

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
</script>

<template>
  <div class="w-full">
    <!-- Search Input -->
    <div class="px-5 pt-[45px] pb-3">
      <SearchInput
        v-model="searchQuery"
        placeholder="Search"
        @keydown="handleKeydown"
      />
    </div>

    <!-- Tabs -->
    <TabBar
      v-model="activeTab"
      :tabs="searchTabs"
    />

    <!-- Discover State (no search query) -->
    <template v-if="!isSearching">
      <!-- User Suggestions -->
      <Section
        title="User Suggestions"
        show-action
        action-label="View all"
        class="mt-3"
      >
        <UserSuggestions :users="suggestions" />
      </Section>

      <!-- Popular Films -->
      <Section
        title="Popular Films"
        show-action
        action-label="View all"
        class="mt-4"
      >
        <ul class="flex flex-col">
          <li v-for="film in popularFilms" :key="film.title" class="flex items-center gap-3 px-5 py-2">
            <div class="shrink-0 w-12 h-[71px] rounded-sm border border-border overflow-hidden bg-muted">
              <img :src="film.image" :alt="film.title" class="w-full h-full object-cover">
            </div>
            <div class="min-w-0 flex-1 flex flex-col gap-1.5">
              <p class="font-bold text-base text-foreground truncate">
                {{ film.title }}
              </p>
              <div class="flex items-center gap-1.5">
                <span class="inline-flex items-center gap-0.5 rounded px-1 text-xs font-medium bg-blue-100 text-foreground h-5">Film</span>
                <span class="text-sm text-foreground/80">{{ film.meta }}</span>
              </div>
            </div>
          </li>
        </ul>
      </Section>

      <!-- Popular Albums -->
      <Section
        title="Popular Albums"
        show-action
        action-label="View all"
        class="mt-4 pb-4"
      >
        <ul class="flex flex-col">
          <li v-for="album in popularAlbums" :key="album.title" class="flex items-center gap-3 px-5 py-2">
            <div class="shrink-0 w-12 h-12 rounded-sm border border-border overflow-hidden bg-muted">
              <img :src="album.image" :alt="album.title" class="w-full h-full object-cover">
            </div>
            <div class="min-w-0 flex-1 flex flex-col gap-1.5">
              <p class="font-bold text-base text-foreground truncate">
                {{ album.title }}
              </p>
              <div class="flex items-center gap-1.5">
                <span class="inline-flex items-center gap-0.5 rounded px-1 text-xs font-medium bg-green-100 text-foreground h-5">Album</span>
                <span class="text-sm text-foreground/80">{{ album.meta }}</span>
              </div>
            </div>
          </li>
        </ul>
      </Section>
    </template>

    <!-- No Results -->
    <div v-else-if="!hasResults" class="text-center py-16 px-4">
      <h3 class="text-lg font-medium text-foreground mb-2">
        No results found
      </h3>
      <p class="text-foreground/60">
        Try searching for something else
      </p>
    </div>

    <!-- Search Results -->
    <div v-else>
      <!-- People Section -->
      <div v-if="filteredAccounts.length > 0">
        <Section title="People" class="mt-3">
          <div class="divide-y divide-border">
            <NuxtLink
              v-for="account in filteredAccounts"
              :key="account.id"
              :to="getProfileUrl(account.acct)"
              class="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors no-underline"
            >
              <img
                :src="account.avatar"
                :alt="account.displayName"
                class="w-11 h-11 rounded-full border border-border shrink-0"
              >
              <div class="flex-1 min-w-0">
                <p class="font-bold text-base text-foreground truncate">
                  {{ account.displayName || account.username }}
                </p>
                <p class="text-sm text-foreground/80 truncate">
                  @{{ account.acct }}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                class="shrink-0"
                @click.prevent.stop="toggleFollow(account.id)"
              >
                {{ isFollowing(account.id) ? 'Following' : 'Follow' }}
              </Button>
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
          :get-profile-url="getProfileUrl"
          @status-click="handleStatusClick"
          @profile-click="handleProfileClick"
          @tag-click="handleTagClick"
          @send-message="handleSendMessage"
          @media-click="handleMediaClick"
        />
      </div>
    </div>
  </div>
</template>
