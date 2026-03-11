<script setup lang="ts">
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui';

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

function getLinkPageUrl(url: string): string {
  return `/links/${encodeURIComponent(url)}`;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  }
  catch {
    return url;
  }
}

function handleFaviconError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
}
</script>

<template>
  <Card class="rounded-xl border-gray-200 shadow-none">
    <CardHeader class="p-4 pb-0">
      <CardTitle class="text-[13px] font-medium text-gray-500">
        Trending News
      </CardTitle>
    </CardHeader>
    <CardContent class="p-4 pt-3">
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
                class="w-4 h-4 rounded mt-0.5 shrink-0"
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
    </CardContent>
    <CardFooter class="px-4 pb-4">
      <NuxtLink
        to="/explore/news"
        class="text-[13px] text-gray-500 hover:text-gray-700 transition-colors"
      >
        See more
      </NuxtLink>
    </CardFooter>
  </Card>
</template>
