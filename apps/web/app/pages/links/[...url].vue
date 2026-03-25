<script setup lang="ts">
import { computed } from 'vue';

const route = useRoute();
const { getStatusesByLink, getLinkInfo } = useExploreData();

const linkUrl = computed(() => {
  const url = route.params.url;
  return Array.isArray(url) ? url.join('/') : url;
});

const linkInfo = computed(() => getLinkInfo(linkUrl.value || ''));
const { data: rawStatuses, isLoading } = getStatusesByLink(linkUrl.value || '');

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  }
  catch {
    return 'Link';
  }
}

const statuses = useWebActions().withStoreState(rawStatuses);

usePageHeader({
  title: computed(() => linkInfo.value ? getDomain(linkInfo.value.url) : 'Link'),
  subtitle: computed(() => `${statuses.value.length} posts`),
});
</script>

<template>
  <div class="w-full">
    <StatusTimeline
      :statuses="statuses"
      :is-loading="isLoading"
      empty-title="No posts yet"
      empty-description="No one has shared this link yet"
    />
  </div>
</template>
