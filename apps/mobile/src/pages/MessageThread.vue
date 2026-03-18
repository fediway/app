<script setup lang="ts">
import { PhChatCircle } from '@phosphor-icons/vue';
import { EmptyState } from '@repo/ui';
</script>

<template>
  <EmptyState
    :icon="PhChatCircle"
    title="Conversation"
    description="Message threads will be available soon."
  />
</template>
