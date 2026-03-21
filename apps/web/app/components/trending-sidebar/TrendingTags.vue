<script setup lang="ts">
import { Card, CardContent, CardFooter, CardHeader, CardTitle, TagListItem } from '@repo/ui';
import { computed } from 'vue';

const router = useRouter();
const { getTrendingTags, getStatusesByTag } = useExploreData();
const { data: tags } = getTrendingTags();

const trendingTags = computed(() =>
  tags.value.slice(0, 7).map(tag => ({
    name: tag.name,
    postCount: getStatusesByTag(tag.name).data.value.length || undefined,
  })),
);

function handleTagClick(name: string) {
  router.push(`/tags/${name}`);
}
</script>

<template>
  <Card class="rounded-xl border-gray-200 shadow-none dark:border-gray-800">
    <CardHeader class="p-4 pb-0">
      <CardTitle class="text-[13px] font-medium text-gray-500 dark:text-gray-400">
        Trending Tags
      </CardTitle>
    </CardHeader>
    <CardContent class="p-4 pt-3">
      <div class="-mx-3 space-y-0.5">
        <TagListItem
          v-for="tag in trendingTags"
          :key="tag.name"
          :name="tag.name"
          :post-count="tag.postCount"
          @click="handleTagClick"
        />
      </div>
    </CardContent>
    <CardFooter class="px-4 pb-4">
      <NuxtLink
        to="/explore/tags"
        class="text-[13px] text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        See more
      </NuxtLink>
    </CardFooter>
  </Card>
</template>
