<script setup lang="ts">
import { Card, CardContent, CardFooter, CardHeader, CardTitle, TagListItem } from '@repo/ui';
import { computed } from 'vue';

const router = useRouter();
const { getTrendingTags } = useExploreData();
const { data: tags, error } = getTrendingTags();

const trendingTags = computed(() =>
  tags.value.slice(0, 5).map(tag => ({
    name: tag.name,
    postCount: tag.history?.[0]?.uses ? `${tag.history[0].uses} posts` : undefined,
  })),
);

function handleTagClick(name: string) {
  router.push(`/tags/${name}`);
}
</script>

<template>
  <Card v-if="!error && trendingTags.length > 0" class="rounded-2xl border-border shadow-none">
    <CardHeader class="p-4 pb-0">
      <CardTitle class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Trending Tags
      </CardTitle>
    </CardHeader>
    <CardContent class="p-4 pt-3 pb-2">
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
        class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
      >
        See more
      </NuxtLink>
    </CardFooter>
  </Card>
</template>
