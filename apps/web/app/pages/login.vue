<script setup lang="ts">
import { PhArrowLeft, PhCircleNotch, PhEnvelope, PhGlobe, PhLock } from '@phosphor-icons/vue';
import { useAuth } from '@repo/api';
import { Button, InputGroup, InputGroupAddon, InputGroupInput } from '@repo/ui';
import { computed, ref } from 'vue';
import { useDataMode } from '~/composables/useDataMode';

const PROTOCOL_RE = /^https?:\/\//;
const TRAILING_SLASH_RE = /\/$/;
const DOMAIN_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;

definePageMeta({
  layout: 'auth',
});

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const { login, loginWithOAuth, loginWithDirectAuth } = useAuth();
const { mode, setMode } = useDataMode();

// The redirect destination after successful login (preserved from middleware)
const redirectTo = computed(() => (route.query.redirect as string) || '/');

// Form fields
const instanceDomain = ref(config.public.defaultInstance as string);
const accessToken = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const showDevLogin = ref(false);
const email = ref('');
const password = ref('');

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

// Direct-auth password grant — shown only when typing the home instance with the flag on
const homeInstance = computed(() => String(config.public.defaultInstance ?? '').toLowerCase());
const directAuthEnabled = computed(() => Boolean(config.public.fediwayAuthDirect));
const showPasswordForm = computed(() =>
  directAuthEnabled.value && !!homeInstance.value && normalizedDomain.value === homeInstance.value,
);
const canDirectLogin = computed(() =>
  showPasswordForm.value && !!email.value.trim() && !!password.value && !isLoading.value,
);

async function handleOAuthLogin() {
  if (!canSignIn.value)
    return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // Persist redirect destination so it survives the OAuth round-trip
    if (redirectTo.value !== '/') {
      sessionStorage.setItem('fediway_login_redirect', redirectTo.value);
    }
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
    setMode('live');
    navigateTo(redirectTo.value, { replace: true });
  }
  catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to authenticate';
  }
  finally {
    isLoading.value = false;
  }
}

async function handleDirectLogin() {
  if (!canDirectLogin.value)
    return;

  const clientId = String(config.public.fediwayClientId ?? '');
  const clientSecret = String(config.public.fediwayClientSecret ?? '');
  if (!clientId || !clientSecret) {
    errorMessage.value = 'Direct login is not configured.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await loginWithDirectAuth(normalizedDomain.value, email.value.trim(), password.value, clientId, clientSecret);
    setMode('live');
    navigateTo(redirectTo.value, { replace: true });
  }
  catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to sign in';
  }
  finally {
    isLoading.value = false;
  }
}

function handleMockMode() {
  setMode('mock');
  navigateTo('/', { replace: true });
}

function handleSubmit() {
  if (showPasswordForm.value) {
    if (canDirectLogin.value)
      handleDirectLogin();
    return;
  }
  if (showDevLogin.value && canDevLogin.value) {
    handleDevLogin();
    return;
  }
  if (canSignIn.value) {
    handleOAuthLogin();
  }
}
</script>

<template>
  <div class="relative flex min-h-[100dvh] flex-col">
    <button
      type="button"
      class="absolute left-4 top-4 z-20 flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label="Go back"
      @click="router.back()"
    >
      <PhArrowLeft :size="20" />
    </button>

    <div class="relative z-10 flex flex-1 flex-col px-5 pt-12 pb-0 lg:py-12">
      <div class="flex flex-1 flex-col items-center justify-center lg:mb-10 lg:flex-none">
        <div class="flex items-center gap-3">
          <img
            src="/images/app-icon.svg"
            alt=""
            aria-hidden="true"
            class="h-12 w-12"
          >
          <span class="text-3xl font-bold text-foreground">Fediway</span>
        </div>
      </div>

      <div class="-mx-5 mt-auto w-[calc(100%+2.5rem)] border-t border-border bg-background px-5 py-8 lg:mx-auto lg:mt-0 lg:w-full lg:max-w-md lg:rounded-3xl lg:border lg:shadow-2xl">
        <form
          :aria-busy="isLoading"
          @submit.prevent="handleSubmit"
        >
          <!-- Error -->
          <div
            v-if="errorMessage"
            id="login-error"
            role="alert"
            class="mb-4 rounded-xl border border-red-200 bg-red-background p-3 text-sm text-red"
          >
            {{ errorMessage }}
          </div>

          <!-- Instance input -->
          <label
            for="instance-domain"
            class="mb-1.5 block text-sm font-semibold text-foreground"
          >
            Your Mastodon server
          </label>
          <InputGroup class="h-12 rounded-full">
            <InputGroupAddon>
              <PhGlobe :size="20" aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              id="instance-domain"
              v-model="instanceDomain"
              type="text"
              placeholder="fediway.com"
              aria-label="Your Mastodon server"
              :aria-describedby="errorMessage ? 'login-error' : 'instance-help'"
              :aria-invalid="errorMessage ? true : undefined"
              required
              autocomplete="off"
              autocapitalize="none"
              spellcheck="false"
              class="h-12 text-base"
            />
          </InputGroup>
          <p
            id="instance-help"
            class="mt-2 text-xs text-muted-foreground"
          >
            Fediway is built on Mastodon. Sign in with any Mastodon server.
          </p>

          <!-- Email + password — only when typing the home instance with direct auth enabled -->
          <div v-if="showPasswordForm" class="mt-4 space-y-3">
            <InputGroup class="h-12 rounded-full">
              <InputGroupAddon>
                <PhEnvelope :size="20" aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id="login-email"
                v-model="email"
                type="email"
                placeholder="Email"
                aria-label="Email"
                autocomplete="email"
                required
                class="h-12 text-base"
              />
            </InputGroup>
            <InputGroup class="h-12 rounded-full">
              <InputGroupAddon>
                <PhLock :size="20" aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id="login-password"
                v-model="password"
                type="password"
                placeholder="Password"
                aria-label="Password"
                autocomplete="current-password"
                required
                class="h-12 text-base"
              />
            </InputGroup>
          </div>

          <Button
            type="submit"
            :disabled="showPasswordForm ? !canDirectLogin : !canSignIn"
            class="mt-4 w-full"
          >
            <PhCircleNotch v-if="isLoading" :size="20" class="animate-spin" aria-hidden="true" />
            {{ isLoading ? 'Signing in…' : 'Sign in' }}
          </Button>

          <!-- Mock data — only visible in dev/mock mode -->
          <Button
            v-if="mode === 'mock'"
            type="button"
            variant="secondary"
            class="mt-3 w-full"
            @click="handleMockMode"
          >
            Continue with mock data
          </Button>
        </form>

        <!-- Links -->
        <div class="mt-5 flex items-center justify-center gap-4 text-base">
          <a
            :href="isValidDomain ? `${normalizedUrl}/auth/sign_up` : undefined"
            :target="isValidDomain ? '_blank' : undefined"
            rel="noopener noreferrer"
            class="font-semibold text-foreground decoration-secondary underline underline-offset-2 transition-colors hover:text-foreground/70"
            :class="{ 'opacity-40 pointer-events-none': !isValidDomain }"
            @click="useAnalytics().trackSignupStarted()"
          >
            Sign up
          </a>
          <span class="text-muted-foreground" aria-hidden="true">&middot;</span>
          <a
            href="https://joinmastodon.org"
            target="_blank"
            rel="noopener noreferrer"
            class="font-semibold text-foreground decoration-secondary underline underline-offset-2 transition-colors hover:text-foreground/70"
          >
            Learn more
          </a>
        </div>

        <!-- Developer login -->
        <div class="mt-6 border-t border-border pt-4">
          <button
            type="button"
            class="text-xs text-muted-foreground transition-colors hover:text-foreground/60"
            :aria-expanded="showDevLogin"
            @click="showDevLogin = !showDevLogin"
          >
            {{ showDevLogin ? 'Hide' : 'Developer login' }}
          </button>

          <div v-if="showDevLogin" class="mt-3 space-y-3">
            <InputGroup class="h-12 rounded-full">
              <InputGroupAddon>
                <PhLock :size="20" aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                v-model="accessToken"
                type="password"
                placeholder="Access token"
                aria-label="Access token"
                aria-describedby="dev-login-hint"
                required
                autocomplete="off"
                class="h-12 text-base"
              />
            </InputGroup>
            <p id="dev-login-hint" class="text-xs text-muted-foreground">
              Generate a token in your instance's Settings &gt; Development &gt; New Application
            </p>
            <Button
              type="button"
              size="sm"
              :disabled="!canDevLogin"
              class="w-full"
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
