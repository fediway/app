<script setup lang="ts">
import { PhArrowLeft, PhChatCircle } from '@phosphor-icons/vue';
import { Button } from '@repo/ui';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const _threadId = route.params.id;
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <!-- Header -->
    <header class="sticky top-[calc(3.5rem+var(--safe-area-inset-top))] z-10 flex items-center gap-3 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
      <Button variant="muted" size="icon" class="-ml-2 size-9" @click="router.back()">
        <PhArrowLeft :size="20" />
      </Button>
      <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Conversation
      </h1>
    </header>

    <div class="flex flex-1 flex-col items-center justify-center px-4 py-20">
      <PhChatCircle :size="32" class="mb-4 text-gray-400" />
      <p class="text-center text-sm text-gray-500">
        Message threads will be available soon.
      </p>
    </div>
  </div>
</template>
