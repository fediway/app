<script setup lang="ts">
const route = useRoute();
const acct = computed(() => route.params.acct as string);
const { getAccountFollowing } = useAccountData();
const { data: following, isLoading } = getAccountFollowing(acct.value);
</script>

<template>
  <AccountCardList
    :accounts="following"
    :is-loading="isLoading"
    empty-title="Not following anyone"
    empty-description="This account isn't following anyone yet."
  />
</template>
