<script setup lang="ts">
import { useAuth } from '@repo/api';

const { isAuthenticated } = useAuth();
</script>

<template>
  <div class="flex flex-col gap-4">
    <TrendingNews />
    <ClientOnly>
      <TrendingTags />
    </ClientOnly>
    <ClientOnly>
      <SuggestedAccounts v-if="isAuthenticated" />
    </ClientOnly>
    <SidebarFooter />
  </div>
</template>
