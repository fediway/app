<script setup lang="ts">
import { Button } from '@repo/ui';

const props = defineProps<{
  error: {
    statusCode?: number;
    message?: string;
    stack?: string;
  };
}>();

const is404 = computed(() => props.error.statusCode === 404);
const isDev = import.meta.dev;

function handleAction() {
  clearError({ redirect: '/' });
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-white px-4 dark:bg-gray-900">
    <div class="text-center">
      <!-- Status code -->
      <p class="text-6xl font-bold text-gray-200 dark:text-gray-800">
        {{ error.statusCode || 500 }}
      </p>

      <!-- Title -->
      <h1 class="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
        {{ is404 ? 'Page not found' : 'Something went wrong' }}
      </h1>

      <!-- Description -->
      <p class="mt-2 text-gray-500 dark:text-gray-400">
        {{ is404 ? 'The page you\'re looking for doesn\'t exist.' : 'An unexpected error occurred.' }}
      </p>

      <!-- Dev error detail -->
      <p v-if="isDev && error.message" class="mt-4 max-w-md rounded bg-gray-100 p-3 text-left text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
        {{ error.message }}
      </p>

      <!-- Action -->
      <div class="mt-8">
        <Button @click="handleAction">
          {{ is404 ? 'Go home' : 'Reload' }}
        </Button>
      </div>
    </div>
  </div>
</template>
