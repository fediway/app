<script setup lang="ts">
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
    <ExploreHeader title="Explore" />

    <div class="divide-y divide-gray-100">
      <NuxtLink
        v-for="link in trendingLinks"
        :key="link.url"
        :to="getLinkPageUrl(link.url)"
        class="block px-4 py-4 hover:bg-gray-50 transition-colors no-underline"
      >
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            <img
              :src="link.favicon"
              :alt="link.source"
              class="w-5 h-5"
              @error="handleFaviconError"
            >
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-[15px] font-medium text-gray-900 leading-snug mb-1">
              {{ link.title }}
            </div>
            <p class="text-[14px] text-gray-600 line-clamp-2 mb-2">
              {{ link.description }}
            </p>
            <div class="flex items-center gap-3 text-[13px] text-gray-500">
              <span>{{ link.source }}</span>
              <span>{{ link.posts }} posts</span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
