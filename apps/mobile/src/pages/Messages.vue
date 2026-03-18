<script setup lang="ts">
import { PhChatCircle } from '@phosphor-icons/vue';
import { EmptyState } from '@repo/ui';
</script>

<template>
  <EmptyState
    :icon="PhChatCircle"
    title="Direct Messages"
    description="Conversations will be available soon."
  />
</template>
