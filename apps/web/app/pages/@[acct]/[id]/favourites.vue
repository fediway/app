<script setup lang="ts">
const route = useRoute();
const statusId = computed(() => route.params.id as string);
const { getFavouritedBy } = useStatusData();
const { data: accounts, isLoading } = getFavouritedBy(statusId.value);

usePageHeader({ title: 'Likes' });
</script>

<template>
  <AccountCardList
    :accounts="accounts"
    :is-loading="isLoading"
    empty-title="No likes"
    empty-description="No one has liked this post yet."
  />
</template>
