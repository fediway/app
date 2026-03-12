<script setup lang="ts">
import { useAuth } from '@repo/api';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@repo/ui';
import Button from '@ui/components/ui/button/Button.vue';
import { computed, ref } from 'vue';
import { clearLiveCache } from '~/composables/useData';
import { useDataMode } from '~/composables/useDataMode';

const PROTOCOL_RE = /^https?:\/\//;
const TRAILING_SLASH_RE = /\/$/;
const DOMAIN_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;

definePageMeta({
  layout: 'auth',
});

const config = useRuntimeConfig();
const { login, loginWithOAuth } = useAuth();
const { setMode } = useDataMode();

// Form fields
const instanceDomain = ref(config.public.defaultInstance as string);
const accessToken = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const showDevLogin = ref(false);

// Validation
const normalizedUrl = computed(() => {
  let domain = instanceDomain.value.trim().toLowerCase();
  domain = domain.replace(PROTOCOL_RE, '');
  domain = domain.replace(TRAILING_SLASH_RE, '');
  return `https://${domain}`;
});

const normalizedDomain = computed(() => {
  let domain = instanceDomain.value.trim().toLowerCase();
  domain = domain.replace(PROTOCOL_RE, '');
  domain = domain.replace(TRAILING_SLASH_RE, '');
  return domain;
});

const isValidDomain = computed(() => {
  const domain = normalizedDomain.value;
  if (!domain)
    return false;
  return DOMAIN_RE.test(domain);
});

const canSignIn = computed(() => {
  return isValidDomain.value && !isLoading.value;
});

const canDevLogin = computed(() => {
  return isValidDomain.value && accessToken.value.trim() && !isLoading.value;
});

async function handleOAuthLogin() {
  if (!canSignIn.value)
    return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await loginWithOAuth(normalizedDomain.value);
    // loginWithOAuth redirects — we won't reach here unless something fails
  }
  catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to connect to instance';
    isLoading.value = false;
  }
}

async function handleDevLogin() {
  if (!canDevLogin.value)
    return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await login(normalizedUrl.value, accessToken.value.trim());
    clearLiveCache();
    setMode('live');
    navigateTo('/');
  }
  catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to authenticate';
  }
  finally {
    isLoading.value = false;
  }
}

function handleMockMode() {
  setMode('mock');
  navigateTo('/');
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    if (showDevLogin.value && canDevLogin.value) {
      handleDevLogin();
    }
    else if (canSignIn.value) {
      handleOAuthLogin();
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="flex justify-center mb-8">
        <img src="/images/icon.png" alt="Fediway" class="w-16 h-16">
      </div>

      <!-- Sign In Card -->
      <div class="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6">
        <h1 class="text-xl font-semibold text-gray-900 text-center mb-6">
          Sign in
        </h1>

        <!-- Error -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {{ errorMessage }}
        </div>

        <!-- Form Fields -->
        <div class="space-y-4">
          <!-- Instance -->
          <InputGroup class="rounded-xl h-12">
            <InputGroupAddon>
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </InputGroupAddon>
            <InputGroupInput
              v-model="instanceDomain"
              type="text"
              placeholder="Instance (e.g. mastodon.social)"
              autocomplete="off"
              autocapitalize="none"
              spellcheck="false"
              class="h-12 text-base"
              @keydown="handleKeydown"
            />
          </InputGroup>
        </div>

        <!-- Buttons -->
        <div class="flex flex-col gap-3 mt-6">
          <Button
            :disabled="!canSignIn"
            class="w-full py-3 rounded-xl"
            @click="handleOAuthLogin"
          >
            <span v-if="isLoading" class="inline-flex items-center justify-center gap-2">
              <svg class="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </span>
            <span v-else>Sign in</span>
          </Button>
          <Button
            variant="secondary"
            class="w-full py-3 rounded-xl"
            @click="handleMockMode"
          >
            Continue with mock data
          </Button>
        </div>

        <!-- Developer Login Toggle -->
        <div class="mt-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            @click="showDevLogin = !showDevLogin"
          >
            {{ showDevLogin ? 'Hide' : 'Developer login' }}
          </button>

          <div v-if="showDevLogin" class="mt-3 space-y-3">
            <InputGroup class="rounded-xl h-12">
              <InputGroupAddon>
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </InputGroupAddon>
              <InputGroupInput
                v-model="accessToken"
                type="password"
                placeholder="Access token"
                autocomplete="off"
                class="h-12 text-base"
                @keydown="handleKeydown"
              />
            </InputGroup>
            <p class="text-xs text-gray-400">
              Generate a token in your instance's Settings &gt; Development &gt; New Application
            </p>
            <Button
              size="sm"
              :disabled="!canDevLogin"
              class="w-full rounded-xl"
              @click="handleDevLogin"
            >
              Connect with token
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
