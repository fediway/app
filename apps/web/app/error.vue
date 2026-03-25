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
  <div class="flex min-h-screen flex-col items-center justify-center bg-card px-4">
    <div class="text-center">
      <!-- Status code -->
      <p class="text-6xl font-bold text-accent">
        {{ error.statusCode || 500 }}
      </p>

      <!-- Title -->
      <h1 class="mt-4 text-xl font-semibold text-foreground">
        {{ is404 ? 'Page not found' : 'Something went wrong' }}
      </h1>

      <!-- Description -->
      <p class="mt-2 text-muted-foreground">
        {{ is404 ? 'The page you\'re looking for doesn\'t exist.' : 'An unexpected error occurred.' }}
      </p>

      <!-- Dev error detail -->
      <p v-if="isDev && error.message" class="mt-4 max-w-md rounded bg-muted p-3 text-left text-xs text-muted-foreground">
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
