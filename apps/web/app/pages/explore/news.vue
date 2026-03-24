<script setup lang="ts">
const { exploreTabs } = useDiscoveryTabs();

const trendingLinks = [
  {
    title: 'Scientists discover high-temperature superconductor at room pressure',
    description: 'A breakthrough in materials science could revolutionize energy transmission and computing technology.',
    url: 'https://github.com/articles/superconductor-discovery',
    favicon: 'https://github.githubassets.com/favicons/favicon.svg',
    source: 'github.com',
    posts: '3.2k',
  },
  {
    title: 'OpenAI announces GPT-5 with improved reasoning',
    description: 'The latest language model shows significant improvements in mathematical reasoning and code generation.',
    url: 'https://nytimes.com/openai-gpt5',
    favicon: 'https://www.nytimes.com/vi-assets/static-assets/favicon-4bf96cb6a1093748bf5b3c429accb9b4.ico',
    source: 'nytimes.com',
    posts: '2.8k',
  },
  {
    title: 'EU passes new digital privacy regulations',
    description: 'New laws will require tech companies to provide more transparency about data collection practices.',
    url: 'https://bbc.com/eu-privacy-law',
    favicon: 'https://static.bbci.co.uk/wwhp/1.146.0/responsive/img/apple-touch/apple-touch-180.jpg',
    source: 'bbc.com',
    posts: '1.9k',
  },
  {
    title: 'SpaceX Starship completes orbital flight',
    description: 'The largest rocket ever built successfully completed its first full orbital mission.',
    url: 'https://youtube.com/starship-orbital',
    favicon: 'https://www.youtube.com/s/desktop/c01ea7e3/img/favicon_32x32.png',
    source: 'youtube.com',
    posts: '1.5k',
  },
  {
    title: 'New study reveals benefits of remote work on productivity',
    description: 'Research spanning 500 companies shows hybrid work models lead to better employee satisfaction.',
    url: 'https://techcrunch.com/remote-work-study',
    favicon: 'https://techcrunch.com/favicon.ico',
    source: 'techcrunch.com',
    posts: '1.2k',
  },
  {
    title: 'Climate summit reaches historic agreement on emissions',
    description: 'World leaders commit to ambitious targets for reducing carbon emissions by 2030.',
    url: 'https://reuters.com/climate-summit',
    favicon: 'https://www.reuters.com/favicon.ico',
    source: 'reuters.com',
    posts: '980',
  },
];

function handleFaviconError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
}

function getLinkPageUrl(url: string): string {
  return `/links/${encodeURIComponent(url)}`;
}
</script>

<template>
  <div class="w-full">
    <DiscoveryHeader
      :tabs="exploreTabs"
      @search="q => navigateTo({ path: '/search', query: { q } })"
    />

    <div class="divide-y divide-border">
      <NuxtLink
        v-for="link in trendingLinks"
        :key="link.url"
        :to="getLinkPageUrl(link.url)"
        class="block px-4 py-4 no-underline transition-colors hover:bg-muted/50"
      >
        <div class="flex items-start gap-3">
          <div class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
            <img
              :src="link.favicon"
              :alt="link.source"
              class="size-5"
              @error="handleFaviconError"
            >
          </div>
          <div class="min-w-0 flex-1">
            <div class="mb-1 text-[15px] font-medium leading-snug text-foreground">
              {{ link.title }}
            </div>
            <p class="mb-2 line-clamp-2 text-[14px] text-foreground/60">
              {{ link.description }}
            </p>
            <div class="flex items-center gap-3 text-[13px] text-foreground/40">
              <span>{{ link.source }}</span>
              <span>{{ link.posts }} posts</span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
