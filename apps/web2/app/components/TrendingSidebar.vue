<script setup lang="ts">
import { ref } from 'vue';

const searchQuery = ref('');

function handleSearch() {
  if (searchQuery.value.trim()) {
    navigateTo({ path: '/search', query: { q: searchQuery.value } });
  }
}

function handleSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    handleSearch();
  }
}

const trendingLinks = [
  {
    title: 'Scientists discover high-temperature superconductor at room pressure',
    url: 'https://github.com/articles/superconductor-discovery',
    favicon: 'https://github.githubassets.com/favicons/favicon.svg',
    posts: '3.2k',
  },
  {
    title: 'OpenAI announces GPT-5 with improved reasoning',
    url: 'https://nytimes.com/openai-gpt5',
    favicon: 'https://www.nytimes.com/vi-assets/static-assets/favicon-4bf96cb6a1093748bf5b3c429accb9b4.ico',
    posts: '2.8k',
  },
  {
    title: 'EU passes new digital privacy regulations',
    url: 'https://bbc.com/eu-privacy-law',
    favicon: 'https://static.bbci.co.uk/wwhp/1.146.0/responsive/img/apple-touch/apple-touch-180.jpg',
    posts: '1.9k',
  },
  {
    title: 'SpaceX Starship completes orbital flight',
    url: 'https://youtube.com/starship-orbital',
    favicon: 'https://www.youtube.com/s/desktop/c01ea7e3/img/favicon_32x32.png',
    posts: '1.5k',
  },
];

const trendingTags = [
  { tag: '#photography', posts: '2.4k' },
  { tag: '#nature', posts: '1.8k' },
  { tag: '#coding', posts: '1.5k' },
  { tag: '#travel', posts: '1.2k' },
  { tag: '#foodie', posts: '980' },
  { tag: '#music', posts: '870' },
  { tag: '#fitness', posts: '650' },
];

const suggestedAccounts = [
  {
    id: '1',
    displayName: 'Sarah Chen',
    handle: '@sarahchen@mastodon.social',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    bio: 'Developer & open source enthusiast',
  },
  {
    id: '2',
    displayName: 'Alex Rivera',
    handle: '@alex@fosstodon.org',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    bio: 'Photography & nature lover',
  },
  {
    id: '3',
    displayName: 'Jordan Kim',
    handle: '@jordankim@hachyderm.io',
    avatar: 'https://i.pravatar.cc/150?u=jordan',
    bio: 'Tech writer & coffee addict',
  },
];

const { toggleFollow, isFollowing } = useFollows();

function handleFollow(accountId: string) {
  toggleFollow(accountId);
}

function getTagName(tag: string): string {
  return tag.replace(/^#/, '');
}

function getLinkPageUrl(url: string): string {
  return `/links/${encodeURIComponent(url)}`;
}

const footerLinks = [
  'About',
  'Terms',
  'Privacy',
  'Cookies',
  'Accessibility',
];

// Get domain from URL for fallback display
function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  }
  catch {
    return url;
  }
}

// Handle favicon load error - hide the image
function handleFaviconError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Search Bar -->
    <div class="bg-white border border-gray-200 rounded-xl py-3 px-4">
      <div class="flex items-center gap-3">
        <NavIcon name="search" :size="18" class="text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          class="flex-1 border-none bg-transparent text-[15px] outline-none placeholder-gray-400"
          @keydown="handleSearchKeydown"
        >
      </div>
    </div>

    <!-- Trending Links Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-4">
      <h2 class="text-[13px] font-medium text-gray-500 mb-3">
        Trending News
      </h2>
      <ul class="list-none m-0 p-0 space-y-1">
        <li v-for="link in trendingLinks" :key="link.url">
          <NuxtLink
            :to="getLinkPageUrl(link.url)"
            class="block hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors no-underline"
          >
            <div class="flex items-start gap-2">
              <img
                :src="link.favicon"
                :alt="getDomain(link.url)"
                class="w-4 h-4 rounded mt-0.5 flex-shrink-0"
                @error="handleFaviconError"
              >
              <div class="flex-1 min-w-0">
                <div class="text-[13px] text-gray-900 leading-snug line-clamp-2">
                  {{ link.title }}
                </div>
                <div class="text-[12px] text-gray-500 mt-0.5">
                  {{ link.posts }} posts
                </div>
              </div>
            </div>
          </NuxtLink>
        </li>
      </ul>
      <NuxtLink
        to="/explore/news"
        class="block text-[13px] text-gray-500 hover:text-gray-700 mt-3 transition-colors"
      >
        See more
      </NuxtLink>
    </div>

    <!-- Trending Tags Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-4">
      <h2 class="text-[13px] font-medium text-gray-500 mb-3">
        Trending Tags
      </h2>
      <ul class="list-none m-0 p-0 space-y-0.5">
        <li v-for="item in trendingTags" :key="item.tag">
          <NuxtLink
            :to="`/tags/${getTagName(item.tag)}`"
            class="w-full py-1.5 px-2 -mx-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between no-underline"
          >
            <span class="text-[13px] font-medium text-gray-900">{{ item.tag }}</span>
            <span class="text-[12px] text-gray-500">{{ item.posts }}</span>
          </NuxtLink>
        </li>
      </ul>
      <NuxtLink
        to="/explore/tags"
        class="block text-[13px] text-gray-500 hover:text-gray-700 mt-3 transition-colors"
      >
        See more
      </NuxtLink>
    </div>

    <!-- Suggested Accounts Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-4">
      <h2 class="text-[13px] font-medium text-gray-500 mb-3">
        Who to follow
      </h2>
      <ul class="list-none m-0 p-0 space-y-3">
        <li v-for="account in suggestedAccounts" :key="account.id">
          <div class="flex items-start gap-3">
            <img
              :src="account.avatar"
              :alt="account.displayName"
              class="w-10 h-10 rounded-full flex-shrink-0"
            >
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="text-[13px] font-semibold text-gray-900 truncate">
                    {{ account.displayName }}
                  </div>
                  <div class="text-[12px] text-gray-500 truncate">
                    {{ account.handle }}
                  </div>
                </div>
                <button
                  type="button"
                  class="flex-shrink-0 px-3 py-1 text-[12px] font-medium rounded-full transition-colors" :class="[
                    isFollowing(account.id)
                      ? 'text-gray-700 bg-white border border-gray-300 hover:border-red-300 hover:text-red-600'
                      : 'text-gray-900 bg-white border border-gray-300 hover:bg-gray-50',
                  ]"
                  @click="handleFollow(account.id)"
                >
                  {{ isFollowing(account.id) ? 'Following' : 'Follow' }}
                </button>
              </div>
              <p class="text-[12px] text-gray-600 mt-1 line-clamp-1">
                {{ account.bio }}
              </p>
            </div>
          </div>
        </li>
      </ul>
      <NuxtLink
        to="/explore/people"
        class="block text-[13px] text-gray-500 hover:text-gray-700 mt-3 transition-colors"
      >
        See more
      </NuxtLink>
    </div>

    <!-- Footer Links -->
    <footer class="px-2 py-2">
      <nav class="flex flex-wrap gap-x-3 gap-y-1">
        <a
          v-for="link in footerLinks"
          :key="link"
          href="#"
          class="text-xs text-gray-500 hover:text-gray-700 no-underline hover:underline"
        >
          {{ link }}
        </a>
      </nav>
      <p class="text-xs text-gray-400 mt-3">
        &copy; 2026 Fediway
      </p>
    </footer>
  </div>
</template>
