<script setup lang="ts">
const route = useRoute();
const statusId = computed(() => route.params.id as string);
const { getRebloggedBy } = useStatusData();
const { data: accounts, isLoading } = getRebloggedBy(statusId.value);

usePageHeader({ title: 'Reposts' });
</script>

<template>
  <AccountCardList
    :accounts="accounts"
    :is-loading="isLoading"
    empty-title="No reposts"
    empty-description="No one has reposted this post yet."
  />
</template>
