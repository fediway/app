<script setup lang="ts">
import { PhCircleNotch } from '@phosphor-icons/vue';
import { invalidateAllQueries, useAuth } from '@repo/api';
import { onMounted, ref } from 'vue';
import { useDataMode } from '~/composables/useDataMode';

definePageMeta({
  layout: 'auth',
});

const { handleOAuthCallback } = useAuth();
const { setMode } = useDataMode();

const errorMessage = ref('');
const isLoading = ref(true);

onMounted(async () => {
  const route = useRoute();
  const code = route.query.code as string | undefined;
  const queryError = route.query.error as string | undefined;

  if (queryError) {
    errorMessage.value = route.query.error_description as string || queryError;
    isLoading.value = false;
    return;
  }

  if (!code) {
    errorMessage.value = 'No authorization code received';
    isLoading.value = false;
    return;
  }

  try {
    await handleOAuthCallback(code);
    invalidateAllQueries();
    setMode('live');
    navigateTo('/');
  }
  catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Authentication failed';
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="flex justify-center mb-8">
        <img src="/images/icon.png" alt="Fediway" class="w-16 h-16">
      </div>

      <div class="bg-card rounded-2xl shadow-xl border border-border p-6 text-center">
        <!-- Loading -->
        <div v-if="isLoading" class="space-y-4">
          <PhCircleNotch :size="32" class="animate-spin mx-auto text-muted-foreground" />
          <p class="text-sm text-muted-foreground">
            Completing sign in...
          </p>
        </div>

        <!-- Error -->
        <div v-else class="space-y-4">
          <div class="p-3 bg-red-background border border-red-200 rounded-xl text-sm text-red">
            {{ errorMessage }}
          </div>
          <NuxtLink
            to="/login"
            class="inline-block py-2.5 px-6 rounded-xl font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            Try again
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
