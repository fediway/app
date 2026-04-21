<script setup lang="ts">
const route = useRoute();
const acct = computed(() => route.params.acct as string);
const { getAccountStatusesPaginated, getAccountPinnedStatuses } = useAccountData();
const { withStoreState } = useWebActions();

const { data: rawStatuses, isLoading, isLoadingMore, error, hasMore, loadMore, refetch } = getAccountStatusesPaginated(acct.value);
const { data: rawPinned } = getAccountPinnedStatuses(acct.value);

const statusesWithStore = withStoreState(rawStatuses);
const pinnedWithStore = withStoreState(rawPinned);

const pinnedIds = computed(() => new Set(pinnedWithStore.value.map(s => s.id)));
const chronological = computed(() => statusesWithStore.value.filter(s => !pinnedIds.value.has(s.id)));

const hasPinned = computed(() => pinnedWithStore.value.length > 0);
</script>

<template>
  <div>
    <ProfilePinnedSection :statuses="pinnedWithStore" />

    <StatusTimeline
      :statuses="chronological"
      :is-loading="isLoading"
      :is-loading-more="isLoadingMore"
      :has-more="hasMore"
      :error="error"
      :empty-title="hasPinned ? 'No other posts' : 'No posts yet'"
      :empty-description="hasPinned ? '' : 'This user hasn\'t posted anything yet.'"
      @load-more="loadMore()"
      @retry="refetch()"
    />
  </div>
</template>
