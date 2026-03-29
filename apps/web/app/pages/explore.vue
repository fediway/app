<script setup lang="ts">
const { exploreTabs } = useDiscoveryTabs();
</script>

<template>
  <div class="w-full">
    <DiscoveryHeader
      :tabs="exploreTabs"
      @search="q => navigateTo({ path: '/search', query: { q } })"
    />

    <NuxtPage />
  </div>
</template>
