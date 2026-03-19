<script setup lang="ts">
import { PhCircleNotch, PhGlobe, PhLock } from '@phosphor-icons/vue';
import { useAuth } from '@repo/api';
import { Button, InputGroup, InputGroupAddon, InputGroupInput } from '@repo/ui';
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
      <div class="rounded-2xl border border-border bg-card p-6 shadow-xl">
        <h1 class="mb-6 text-center text-xl font-semibold text-foreground">
          Sign in
        </h1>

        <!-- Error -->
        <div v-if="errorMessage" class="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {{ errorMessage }}
        </div>

        <!-- Form Fields -->
        <div class="space-y-4">
          <!-- Instance -->
          <InputGroup class="rounded-xl h-12">
            <InputGroupAddon>
              <PhGlobe :size="20" />
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
              <PhCircleNotch :size="20" class="animate-spin" />
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
        <div class="mt-4 border-t border-border pt-4">
          <button
            type="button"
            class="text-xs text-foreground/40 transition-colors hover:text-foreground/60"
            @click="showDevLogin = !showDevLogin"
          >
            {{ showDevLogin ? 'Hide' : 'Developer login' }}
          </button>

          <div v-if="showDevLogin" class="mt-3 space-y-3">
            <InputGroup class="rounded-xl h-12">
              <InputGroupAddon>
                <PhLock :size="20" />
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
            <p class="text-xs text-foreground/40">
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
