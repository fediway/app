<script setup lang="ts">
import { PhChatCircle } from '@phosphor-icons/vue';
</script>

<template>
  <div class="flex flex-col items-center justify-center px-4 py-20">
    <div class="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
      <PhChatCircle :size="32" class="text-gray-400" />
    </div>
    <h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
      Direct Messages
    </h2>
    <p class="text-center text-sm text-gray-500">
      Conversations will be available soon.
    </p>
  </div>
</template>
