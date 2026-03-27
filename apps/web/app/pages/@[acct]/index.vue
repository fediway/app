<script setup lang="ts">
const route = useRoute();
const acct = computed(() => route.params.acct as string);
const { getAccountStatusesPaginated } = useAccountData();
const { data: rawStatuses, isLoading, isLoadingMore, error, hasMore, loadMore, refetch } = getAccountStatusesPaginated(acct.value);
const statuses = useWebActions().withStoreState(rawStatuses);
</script>

<template>
  <StatusTimeline
    :statuses="statuses"
    :is-loading="isLoading"
    :is-loading-more="isLoadingMore"
    :has-more="hasMore"
    :error="error"
    empty-title="No posts yet"
    empty-description="This user hasn't posted anything yet."
    @load-more="loadMore()"
    @retry="refetch()"
  />
</template>
