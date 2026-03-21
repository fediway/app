<script setup lang="ts">
import { PhArrowSquareOut, PhLink } from '@phosphor-icons/vue';
import { PageHeader } from '@repo/ui';
import { computed } from 'vue';

const route = useRoute();
const { getStatusesByLink, getLinkInfo } = useExploreData();

const linkUrl = computed(() => {
  const url = route.params.url;
  return Array.isArray(url) ? url.join('/') : url;
});

const linkInfo = computed(() => getLinkInfo(linkUrl.value || ''));
const { data: rawStatuses, isLoading } = getStatusesByLink(linkUrl.value || '');
const statuses = useWebActions().withStoreState(rawStatuses);
</script>

<template>
  <div class="w-full">
    <PageHeader
      title="Link"
      :subtitle="`${statuses.length} posts`"
      show-back
      @back="$router.back()"
    />

    <!-- Link Info Banner -->
    <div v-if="linkInfo" class="border-b border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-800/30">
      <a
        :href="linkInfo.url"
        target="_blank"
        rel="noopener noreferrer"
        class="block no-underline"
      >
        <div class="flex items-start gap-3">
          <div class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700">
            <PhLink :size="24" class="text-gray-500 dark:text-gray-400" />
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="line-clamp-2 text-base font-semibold text-gray-900 dark:text-white">
              {{ linkInfo.title }}
            </h2>
            <p class="mt-1 text-sm text-gray-500">
              {{ linkInfo.source }}
            </p>
          </div>
          <PhArrowSquareOut :size="20" class="shrink-0 text-gray-400" />
        </div>
      </a>
    </div>

    <StatusTimeline
      :statuses="statuses"
      :is-loading="isLoading"
      empty-title="No posts yet"
      empty-description="No one has shared this link yet"
    />
  </div>
</template>
