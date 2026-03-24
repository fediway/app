<script setup lang="ts">
const route = useRoute();
const statusId = computed(() => route.params.id as string);
const { getRebloggedBy } = useStatusData();
const { data: accounts, isLoading } = getRebloggedBy(statusId.value);

usePageHeader({ title: 'Reblogs' });
</script>

<template>
  <AccountCardList
    :accounts="accounts"
    :is-loading="isLoading"
    empty-title="No reblogs"
    empty-description="No one has reblogged this post yet."
  />
</template>
