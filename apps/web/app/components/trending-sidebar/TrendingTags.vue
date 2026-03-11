<script setup lang="ts">
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui';

const trendingTags = [
  { tag: '#photography', posts: '2.4k' },
  { tag: '#nature', posts: '1.8k' },
  { tag: '#coding', posts: '1.5k' },
  { tag: '#travel', posts: '1.2k' },
  { tag: '#foodie', posts: '980' },
  { tag: '#music', posts: '870' },
  { tag: '#fitness', posts: '650' },
];

function getTagName(tag: string): string {
  return tag.replace(/^#/, '');
}
</script>

<template>
  <Card class="border-gray-200 shadow-none rounded-xl">
    <CardHeader class="p-4 pb-0">
      <CardTitle class="text-[13px] font-medium text-gray-500">
        Trending Tags
      </CardTitle>
    </CardHeader>
    <CardContent class="p-4 pt-3">
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
    </CardContent>
    <CardFooter class="px-4 pb-4">
      <NuxtLink
        to="/explore/tags"
        class="text-[13px] text-gray-500 hover:text-gray-700 transition-colors"
      >
        See more
      </NuxtLink>
    </CardFooter>
  </Card>
</template>
