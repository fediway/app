<script setup lang="ts">
const route = useRoute();
const acct = computed(() => route.params.acct as string);
const { getAccountStatusesWithReplies } = useAccountData();
const { data: rawStatuses, isLoading } = getAccountStatusesWithReplies(acct.value);
const statuses = useWebActions().withStoreState(rawStatuses);
</script>

<template>
  <StatusTimeline
    :statuses="statuses"
    :is-loading="isLoading"
    empty-title="No posts with replies"
    empty-description="Posts and replies will appear here."
  />
</template>
