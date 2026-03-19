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
  <Card class="rounded-xl border-border shadow-none">
    <CardHeader class="p-4 pb-0">
      <CardTitle class="text-[13px] font-medium text-foreground/40">
        Trending News
      </CardTitle>
    </CardHeader>
    <CardContent class="p-4 pt-3">
      <ul class="m-0 list-none space-y-1 p-0">
        <li v-for="link in trendingLinks" :key="link.url">
          <NuxtLink
            :to="getLinkPageUrl(link.url)"
            class="-mx-2 block rounded-lg px-2 py-1.5 no-underline transition-colors hover:bg-muted/50"
          >
            <div class="flex items-start gap-2">
              <img
                :src="link.favicon"
                :alt="getDomain(link.url)"
                class="mt-0.5 size-4 shrink-0 rounded"
                @error="handleFaviconError"
              >
              <div class="min-w-0 flex-1">
                <div class="line-clamp-2 text-[13px] leading-snug text-foreground">
                  {{ link.title }}
                </div>
                <div class="mt-0.5 text-[12px] text-foreground/40">
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
        class="text-[13px] text-foreground/40 transition-colors hover:text-foreground/60"
      >
        See more
      </NuxtLink>
    </CardFooter>
  </Card>
</template>
