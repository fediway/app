<script setup lang="ts">
const route = useRoute();
const acct = computed(() => route.params.acct as string);
const { getAccountStatuses } = useAccountData();
const { data: rawStatuses, isLoading } = getAccountStatuses(acct.value);
const statuses = useWebActions().withStoreState(rawStatuses);
</script>

<template>
  <StatusTimeline
    :statuses="statuses"
    :is-loading="isLoading"
    empty-title="No posts yet"
    empty-description="This user hasn't posted anything yet."
  />
</template>
