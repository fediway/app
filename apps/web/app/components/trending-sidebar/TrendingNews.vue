<script setup lang="ts">
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui';

const { getTrendingLinks } = useExploreData();
const { data: links, error } = getTrendingLinks();

const topLinks = computed(() => links.value.slice(0, 4));

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
  <ClientOnly>
    <Card v-if="!error && topLinks.length > 0" class="rounded-xl border-border shadow-none">
      <CardHeader class="p-4 pb-0">
        <CardTitle class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Trending News
        </CardTitle>
      </CardHeader>
      <CardContent class="p-4 pt-3 pb-2">
        <ul class="m-0 list-none space-y-1 p-0">
          <li v-for="link in topLinks" :key="link.url">
            <NuxtLink
              :to="getLinkPageUrl(link.url)"
              class="-mx-2 block rounded-lg px-2 py-1.5 no-underline transition-colors hover:bg-muted/50"
            >
              <div class="flex items-start gap-2">
                <img
                  v-if="link.image"
                  :src="link.image"
                  :alt="getDomain(link.url)"
                  class="mt-0.5 size-4 shrink-0 rounded"
                  @error="handleFaviconError"
                >
                <div class="min-w-0 flex-1">
                  <div class="line-clamp-2 text-sm leading-snug text-foreground">
                    {{ link.title }}
                  </div>
                  <div class="mt-0.5 text-xs text-muted-foreground">
                    {{ getDomain(link.url) }}
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
          class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
        >
          See more
        </NuxtLink>
      </CardFooter>
    </Card>
  </ClientOnly>
</template>
