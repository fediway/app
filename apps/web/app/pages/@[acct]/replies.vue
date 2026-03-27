<script setup lang="ts">
const route = useRoute();
const acct = computed(() => route.params.acct as string);
const { getAccountStatusesWithRepliesPaginated } = useAccountData();
const { data: rawStatuses, isLoading, isLoadingMore, error, hasMore, loadMore, refetch } = getAccountStatusesWithRepliesPaginated(acct.value);
const statuses = useWebActions().withStoreState(rawStatuses);
</script>

<template>
  <StatusTimeline
    :statuses="statuses"
    :is-loading="isLoading"
    :is-loading-more="isLoadingMore"
    :has-more="hasMore"
    :error="error"
    empty-title="No posts with replies"
    empty-description="Posts and replies will appear here."
    @load-more="loadMore()"
    @retry="refetch()"
  />
</template>
