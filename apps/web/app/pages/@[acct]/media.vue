<script setup lang="ts">
const route = useRoute();
const acct = computed(() => route.params.acct as string);
const { getAccountMediaStatusesPaginated } = useAccountData();
const { data: rawStatuses, isLoading, isLoadingMore, error, hasMore, loadMore, refetch } = getAccountMediaStatusesPaginated(acct.value);
const statuses = useWebActions().withStoreState(rawStatuses);
</script>

<template>
  <StatusTimeline
    :statuses="statuses"
    :is-loading="isLoading"
    :is-loading-more="isLoadingMore"
    :has-more="hasMore"
    :error="error"
    empty-title="No media"
    empty-description="Posts with images, video, or audio will appear here."
    @load-more="loadMore()"
    @retry="refetch()"
  />
</template>
