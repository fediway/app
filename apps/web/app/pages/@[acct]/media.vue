<script setup lang="ts">
const route = useRoute();
const acct = computed(() => route.params.acct as string);
const { getAccountMediaStatuses } = useAccountData();
const { data: rawStatuses, isLoading } = getAccountMediaStatuses(acct.value);
const statuses = useWebActions().withStoreState(rawStatuses);
</script>

<template>
  <StatusTimeline
    :statuses="statuses"
    :is-loading="isLoading"
    empty-title="No media"
    empty-description="Posts with images, video, or audio will appear here."
  />
</template>
