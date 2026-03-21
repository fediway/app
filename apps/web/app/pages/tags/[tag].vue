<script setup lang="ts">
import { FollowButton, PageHeader } from '@repo/ui';
import { computed } from 'vue';

const route = useRoute();
const { getStatusesByTag } = useExploreData();
const { toggleFollow, isFollowing } = useFollows();

const tagName = computed(() => {
  const tag = route.params.tag;
  return Array.isArray(tag) ? tag[0] : tag;
});

const { data: rawStatuses, isLoading } = getStatusesByTag(tagName.value || '');
const statuses = useWebActions().withStoreState(rawStatuses);

const tagFollowId = computed(() => `tag:${tagName.value}`);
const isFollowingTag = computed(() => isFollowing(tagFollowId.value));
function toggleFollowTag() {
  toggleFollow(tagFollowId.value);
}
</script>

<template>
  <div class="w-full">
    <PageHeader
      :title="`#${tagName}`"
      :subtitle="`${statuses.length} posts`"
      show-back
      @back="$router.back()"
    />

    <!-- Tag Stats Banner -->
    <div class="border-b border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-800/30">
      <div class="flex items-center gap-4">
        <div class="flex size-14 items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-700">
          <span class="text-2xl text-gray-500 dark:text-gray-400">#</span>
        </div>
        <div class="flex-1">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            #{{ tagName }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ statuses.length }} posts from the community
          </p>
        </div>
        <FollowButton
          :is-following="isFollowingTag"
          size="sm"
          @follow="toggleFollowTag"
          @unfollow="toggleFollowTag"
        />
      </div>
    </div>

    <StatusTimeline
      :statuses="statuses"
      :is-loading="isLoading"
      empty-title="No posts yet"
      :empty-description="`Be the first to post with #${tagName}`"
    />
  </div>
</template>
