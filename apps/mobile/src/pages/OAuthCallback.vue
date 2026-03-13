<script setup lang="ts">
import { useAuth } from '@repo/api';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  const code = route.query.code as string | undefined;
  const error = route.query.error as string | undefined;

  if (error) {
    router.replace({ path: '/login', query: { error } });
    return;
  }

  if (code) {
    try {
      const { handleOAuthCallback } = useAuth();
      await handleOAuthCallback(code);
      router.replace('/');
    }
    catch {
      router.replace({ path: '/login', query: { error: 'callback_failed' } });
    }
  }
});
</script>

<template>
  <div class="flex flex-col items-center gap-4 p-8">
    <div class="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
    <p class="text-sm text-gray-500">
      Completing sign in...
    </p>
  </div>
</template>
