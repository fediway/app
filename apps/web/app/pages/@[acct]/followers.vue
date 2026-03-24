<script setup lang="ts">
const route = useRoute();
const acct = computed(() => route.params.acct as string);
const { getAccountFollowers } = useAccountData();
const { data: followers, isLoading } = getAccountFollowers(acct.value);
</script>

<template>
  <AccountCardList
    :accounts="followers"
    :is-loading="isLoading"
    empty-title="No followers"
    empty-description="This account doesn't have any followers yet."
  />
</template>
