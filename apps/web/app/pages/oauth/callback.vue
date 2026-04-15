<script setup lang="ts">
import { useAuth } from '@repo/api';
import { Button } from '@repo/ui';
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
    setMode('live');
    useAnalytics().trackLogin('oauth');

    // Restore redirect destination saved before OAuth round-trip
    const raw = sessionStorage.getItem('fediway_login_redirect') || '/';
    sessionStorage.removeItem('fediway_login_redirect');
    // Validate redirect is a safe relative path (prevent open redirect)
    const redirect = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
    navigateTo(redirect, { replace: true });
  }
  catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Authentication failed';
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="flex min-h-[100dvh] flex-col items-center justify-center px-5">
    <template v-if="isLoading">
      <img
        src="/images/app-icon.svg"
        alt=""
        aria-hidden="true"
        class="h-14 w-14"
      >
      <p class="mt-4 text-sm text-muted-foreground">
        Signing in…
      </p>
    </template>

    <template v-else>
      <div class="mb-10 flex items-center gap-3">
        <img
          src="/images/app-icon.svg"
          alt=""
          aria-hidden="true"
          class="h-12 w-12"
        >
        <span class="text-3xl font-bold text-foreground">Fediway</span>
      </div>

      <div class="w-full max-w-md rounded-3xl border border-border bg-background px-5 py-8 text-center shadow-2xl">
        <div class="space-y-4">
          <div
            role="alert"
            class="rounded-xl border border-red-200 bg-red-background p-3 text-sm text-red"
          >
            {{ errorMessage }}
          </div>
          <Button as-child class="w-full">
            <NuxtLink to="/login">
              Try again
            </NuxtLink>
          </Button>
        </div>
      </div>
    </template>
  </div>
</template>
