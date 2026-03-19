<script setup lang="ts">
import { PhChatCircle } from '@phosphor-icons/vue';

defineProps<{
  acct: string;
}>();
</script>

<template>
  <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
    <PhChatCircle :size="16" />
    <span>Replying to <strong class="text-gray-700 dark:text-gray-300">@{{ acct }}</strong></span>
  </div>
</template>
