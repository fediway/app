<script setup lang="ts">
import { Button } from '@repo/ui';

const props = defineProps<{
  error: {
    statusCode?: number;
    message?: string;
    stack?: string;
  };
}>();

const code = computed(() => props.error.statusCode || 500);
const isDev = import.meta.dev;

if (import.meta.client && code.value === 401) {
  const currentPath = window.location.pathname;
  const redirect = currentPath !== '/login' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
  clearError({ redirect: `/login${redirect}` });
}

const errorConfig = computed(() => {
  switch (code.value) {
    case 401:
      return {
        title: 'Session expired',
        description: 'Please sign in again to continue.',
        action: 'Sign in',
        redirect: '/login',
      };
    case 403:
      return {
        title: 'Access denied',
        description: 'You don\'t have permission to view this page.',
        action: 'Go home',
        redirect: '/',
      };
    case 404:
      return {
        title: 'Page not found',
        description: 'The page you\'re looking for doesn\'t exist or has been moved.',
        action: 'Go home',
        redirect: '/',
      };
    case 429:
      return {
        title: 'Slow down',
        description: 'You\'re making too many requests. Please wait a moment and try again.',
        action: 'Try again',
        redirect: null,
      };
    default:
      return {
        title: code.value >= 500 ? 'Server error' : 'Something went wrong',
        description: code.value >= 500
          ? 'The server encountered an error. This is usually temporary.'
          : 'An unexpected error occurred.',
        action: 'Try again',
        redirect: null,
      };
  }
});

function handleAction() {
  if (errorConfig.value.redirect) {
    clearError({ redirect: errorConfig.value.redirect });
  }
  else {
    clearError();
    window.location.reload();
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-card px-4">
    <div class="text-center">
      <p class="text-6xl font-bold text-accent">
        {{ code }}
      </p>

      <h1 class="mt-4 text-xl font-semibold text-foreground">
        {{ errorConfig.title }}
      </h1>

      <p class="mt-2 text-muted-foreground">
        {{ errorConfig.description }}
      </p>

      <p v-if="isDev && error.message" class="mt-4 max-w-md rounded bg-muted p-3 text-left text-xs text-muted-foreground">
        {{ error.message }}
      </p>

      <div class="mt-8">
        <Button @click="handleAction">
          {{ errorConfig.action }}
        </Button>
      </div>
    </div>
  </div>
</template>
