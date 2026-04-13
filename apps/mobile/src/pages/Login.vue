<script setup lang="ts">
import { useAuth } from '@repo/api';
import { ref } from 'vue';

const { loginWithOAuth } = useAuth();

const instanceDomain = ref('fediway.com');
const isLoading = ref(false);
const errorMessage = ref('');

async function handleLogin() {
  if (!instanceDomain.value.trim() || isLoading.value)
    return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await loginWithOAuth(instanceDomain.value.trim());
  }
  catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to connect to instance';
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen px-4">
    <div class="w-full max-w-sm space-y-6">
      <h1 class="text-xl font-semibold text-center">
        Sign in
      </h1>

      <div v-if="errorMessage" class="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
        {{ errorMessage }}
      </div>

      <div>
        <label
          for="mobile-instance-domain"
          class="mb-1.5 block text-sm font-semibold text-foreground"
        >
          Your Mastodon server
        </label>
        <input
          id="mobile-instance-domain"
          v-model="instanceDomain"
          type="text"
          placeholder="fediway.com"
          aria-describedby="mobile-instance-help"
          autocomplete="off"
          autocapitalize="none"
          spellcheck="false"
          class="w-full px-4 py-3 border border-gray-200 rounded-lg"
          @keydown.enter="handleLogin"
        >
        <p id="mobile-instance-help" class="mt-2 text-xs text-muted-foreground">
          Fediway is built on Mastodon. Sign in with any Mastodon server.
        </p>
      </div>

      <button
        type="button"
        :disabled="isLoading || !instanceDomain.trim()"
        class="w-full py-3 px-4 font-medium rounded-lg bg-gray-900 text-white disabled:opacity-50"
        @click="handleLogin"
      >
        {{ isLoading ? 'Connecting...' : 'Sign in' }}
      </button>
    </div>
  </div>
</template>
