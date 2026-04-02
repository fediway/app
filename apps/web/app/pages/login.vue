<script setup lang="ts">
import { PhArrowLeft, PhCircleNotch, PhGlobe, PhLock } from '@phosphor-icons/vue';
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
const { login, loginWithOAuth } = useAuth();
const { mode, setMode } = useDataMode();

// The redirect destination after successful login (preserved from middleware)
const redirectTo = computed(() => (route.query.redirect as string) || '/');

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
    navigateTo(redirectTo.value);
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

function handleSubmit() {
  if (showDevLogin.value && canDevLogin.value) {
    handleDevLogin();
  }
  else if (canSignIn.value) {
    handleOAuthLogin();
  }
}
</script>

<template>
  <div class="relative flex min-h-[100dvh] flex-col bg-[#ede6d6] dark:bg-[#373442]">
    <!-- Full-screen hero background (inlined SVG — no network request, instant render) -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <!-- Light mode shapes -->
      <svg class="absolute inset-0 h-full w-full dark:hidden" preserveAspectRatio="xMidYMid slice" viewBox="0 0 582.548 550.548" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.6" filter="url(#login-blur-light)">
          <path d="M501.894 371.74H402.068L496.636 346.773C497.531 346.537 498.37 346.126 499.106 345.564C499.841 345.002 500.458 344.3 500.921 343.498C501.384 342.697 501.683 341.811 501.802 340.893C501.921 339.975 501.857 339.043 501.613 338.15L494.462 311.859C493.478 308.322 491.14 305.315 487.955 303.489C484.769 301.664 480.993 301.166 477.443 302.105L343.983 337.335C342.206 337.796 340.539 338.607 339.079 339.721C337.619 340.834 336.396 342.228 335.482 343.82C334.562 345.392 333.968 347.133 333.735 348.94C333.502 350.746 333.634 352.581 334.124 354.336L340.644 378.366C340.644 378.488 340.644 378.62 340.644 378.751V455.871C340.644 459.59 342.121 463.156 344.751 465.786C347.38 468.415 350.947 469.893 354.665 469.893H494.883C498.602 469.893 502.168 468.415 504.798 465.786C507.427 463.156 508.905 459.59 508.905 455.871V378.751C508.905 376.892 508.166 375.109 506.851 373.794C505.536 372.479 503.753 371.74 501.894 371.74ZM481.001 315.653L486.259 334.995L466.436 340.253L441.793 326.021L481.001 315.653ZM422.557 331.077L447.2 345.309L414.827 353.854L390.184 339.639L422.557 331.077ZM352.974 370.181L347.716 350.831L370.939 344.696L395.583 358.946L352.974 370.181ZM494.883 455.871H354.665V385.762H494.883V455.871Z" fill="#383AAA" />
          <path d="M371.752 66.6326H252.567C245.13 66.6326 237.997 69.5872 232.738 74.8463C227.479 80.1055 224.524 87.2385 224.524 94.6761V241.904C224.524 243.764 225.263 245.547 226.577 246.862C227.892 248.177 229.675 248.915 231.535 248.915H357.731C359.59 248.915 361.373 248.177 362.688 246.862C364.003 245.547 364.741 243.764 364.741 241.904C364.741 240.045 364.003 238.262 362.688 236.947C361.373 235.632 359.59 234.893 357.731 234.893H238.546C238.546 231.175 240.023 227.608 242.653 224.979C245.282 222.349 248.849 220.872 252.567 220.872H371.752C373.612 220.872 375.395 220.133 376.71 218.818C378.024 217.504 378.763 215.72 378.763 213.861V73.6435C378.763 71.7841 378.024 70.0008 376.71 68.686C375.395 67.3712 373.612 66.6326 371.752 66.6326ZM364.741 206.85H252.567C247.644 206.843 242.806 208.14 238.546 210.61V94.6761C238.546 90.9573 240.023 87.3908 242.653 84.7612C245.282 82.1316 248.849 80.6543 252.567 80.6543H364.741V206.85Z" fill="#DB741A" />
          <path d="M241.179 368.812C240.303 366.117 238.649 363.742 236.425 361.986C234.201 360.23 231.507 359.172 228.683 358.944L176.977 354.772L157.014 306.494C155.934 303.863 154.097 301.613 151.735 300.029C149.373 298.446 146.594 297.6 143.75 297.6C140.907 297.6 138.127 298.446 135.766 300.029C133.404 301.613 131.566 303.863 130.487 306.494L110.541 354.764L58.8092 358.944C55.9801 359.183 53.2846 360.252 51.0602 362.016C48.8359 363.781 47.1817 366.163 46.305 368.863C45.4282 371.563 45.3679 374.463 46.1315 377.197C46.8951 379.932 48.4488 382.38 50.5978 384.236L90.0339 418.265L78.019 469.146C77.3471 471.91 77.5116 474.812 78.4917 477.482C79.4718 480.153 81.2234 482.472 83.5239 484.146C85.8245 485.819 88.5704 486.771 91.4131 486.881C94.2557 486.991 97.0669 486.253 99.4898 484.763L143.746 457.525L188.028 484.763C190.452 486.236 193.258 486.959 196.091 486.841C198.925 486.723 201.661 485.769 203.953 484.099C206.246 482.429 207.994 480.118 208.976 477.458C209.958 474.797 210.131 471.905 209.473 469.146L197.414 418.256L236.85 384.227C239.017 382.374 240.584 379.921 241.355 377.177C242.126 374.432 242.065 371.521 241.179 368.812ZM227.736 373.605L185.057 410.412C184.084 411.251 183.36 412.342 182.965 413.564C182.569 414.787 182.517 416.094 182.814 417.344L195.854 472.38C195.888 472.456 195.891 472.542 195.864 472.62C195.836 472.698 195.779 472.763 195.705 472.8C195.547 472.923 195.504 472.897 195.372 472.8L147.418 443.311C146.313 442.632 145.042 442.272 143.746 442.272C142.449 442.272 141.178 442.632 140.074 443.311L92.1196 472.818C91.9882 472.897 91.9531 472.923 91.7866 472.818C91.7126 472.78 91.656 472.716 91.6282 472.637C91.6005 472.559 91.6039 472.473 91.6376 472.397L104.678 417.362C104.975 416.112 104.923 414.804 104.527 413.582C104.132 412.359 103.408 411.269 102.434 410.43L59.7557 373.623C59.6505 373.535 59.5541 373.456 59.6418 373.185C59.7294 372.913 59.7995 372.948 59.931 372.931L115.948 368.409C117.233 368.298 118.462 367.836 119.501 367.072C120.54 366.308 121.348 365.273 121.837 364.079L143.413 311.84C143.483 311.691 143.509 311.621 143.72 311.621C143.93 311.621 143.956 311.691 144.026 311.84L165.655 364.079C166.148 365.273 166.961 366.308 168.005 367.069C169.049 367.829 170.283 368.287 171.57 368.391L227.587 372.913C227.719 372.913 227.797 372.913 227.876 373.167C227.955 373.421 227.876 373.518 227.736 373.605Z" fill="#DBA800" />
        </g>
        <defs>
          <filter id="login-blur-light" x="0" y="0" width="582.548" height="550.548" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix" /><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" /><feGaussianBlur stdDeviation="22.8" result="effect1_foregroundBlur" />
          </filter>
        </defs>
      </svg>
      <!-- Dark mode shapes -->
      <svg class="absolute inset-x-0 top-[5%] mx-auto hidden h-[55%] w-[90%] max-w-lg dark:block" preserveAspectRatio="xMidYMid slice" viewBox="0 0 582.548 540.548" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.6" filter="url(#login-blur-dark)">
          <path d="M501.894 361.74H402.068L496.636 336.773C497.531 336.537 498.37 336.126 499.106 335.564C499.841 335.002 500.458 334.3 500.921 333.498C501.384 332.697 501.683 331.811 501.802 330.893C501.921 329.975 501.857 329.043 501.613 328.15L494.462 301.859C493.478 298.322 491.14 295.315 487.955 293.489C484.769 291.664 480.993 291.166 477.443 292.105L343.983 327.335C342.206 327.796 340.539 328.607 339.079 329.721C337.619 330.834 336.396 332.228 335.482 333.82C334.562 335.392 333.968 337.133 333.735 338.94C333.502 340.746 333.634 342.581 334.124 344.336L340.644 368.366C340.644 368.488 340.644 368.62 340.644 368.751V445.871C340.644 449.59 342.121 453.156 344.751 455.786C347.38 458.415 350.947 459.893 354.665 459.893H494.883C498.602 459.893 502.168 458.415 504.798 455.786C507.427 453.156 508.905 449.59 508.905 445.871V368.751C508.905 366.892 508.166 365.109 506.851 363.794C505.536 362.479 503.753 361.74 501.894 361.74ZM481.001 305.653L486.259 324.995L466.436 330.253L441.793 316.021L481.001 305.653ZM422.557 321.077L447.2 335.309L414.827 343.854L390.184 329.639L422.557 321.077ZM352.974 360.181L347.716 340.831L370.939 334.696L395.583 348.946L352.974 360.181ZM494.883 445.871H354.665V375.762H494.883V445.871Z" fill="#383AAA" />
          <path d="M371.752 66.6326H252.567C245.13 66.6326 237.997 69.5872 232.738 74.8463C227.479 80.1055 224.524 87.2385 224.524 94.6761V241.904C224.524 243.764 225.263 245.547 226.577 246.862C227.892 248.177 229.675 248.915 231.535 248.915H357.731C359.59 248.915 361.373 248.177 362.688 246.862C364.003 245.547 364.741 243.764 364.741 241.904C364.741 240.045 364.003 238.262 362.688 236.947C361.373 235.632 359.59 234.893 357.731 234.893H238.546C238.546 231.175 240.023 227.608 242.653 224.979C245.282 222.349 248.849 220.872 252.567 220.872H371.752C373.612 220.872 375.395 220.133 376.71 218.818C378.024 217.504 378.763 215.72 378.763 213.861V73.6435C378.763 71.7841 378.024 70.0008 376.71 68.686C375.395 67.3712 373.612 66.6326 371.752 66.6326ZM364.741 206.85H252.567C247.644 206.843 242.806 208.14 238.546 210.61V94.6761C238.546 90.9573 240.023 87.3908 242.653 84.7612C245.282 82.1316 248.849 80.6543 252.567 80.6543H364.741V206.85Z" fill="#DB741A" />
          <path d="M241.179 358.812C240.303 356.117 238.649 353.742 236.425 351.986C234.201 350.23 231.507 349.172 228.683 348.944L176.977 344.772L157.014 296.494C155.934 293.863 154.097 291.613 151.735 290.029C149.373 288.446 146.594 287.6 143.75 287.6C140.907 287.6 138.127 288.446 135.766 290.029C133.404 291.613 131.566 293.863 130.487 296.494L110.541 344.764L58.8092 348.944C55.9801 349.183 53.2846 350.252 51.0602 352.016C48.8359 353.781 47.1817 356.163 46.305 358.863C45.4282 361.563 45.3679 364.463 46.1315 367.197C46.8951 369.932 48.4488 372.38 50.5978 374.236L90.0339 408.265L78.019 459.146C77.3471 461.91 77.5116 464.812 78.4917 467.482C79.4718 470.153 81.2234 472.472 83.5239 474.146C85.8245 475.819 88.5704 476.771 91.4131 476.881C94.2557 476.991 97.0669 476.253 99.4898 474.763L143.746 447.525L188.028 474.763C190.452 476.236 193.258 476.959 196.091 476.841C198.925 476.723 201.661 475.769 203.953 474.099C206.246 472.429 207.994 470.118 208.976 467.458C209.958 464.797 210.131 461.905 209.473 459.146L197.414 408.256L236.85 374.227C239.017 372.374 240.584 369.921 241.355 367.177C242.126 364.432 242.065 361.521 241.179 358.812ZM227.736 363.605L185.057 400.412C184.084 401.251 183.36 402.342 182.965 403.564C182.569 404.787 182.517 406.094 182.814 407.344L195.854 462.38C195.888 462.456 195.891 462.542 195.864 462.62C195.836 462.698 195.779 462.763 195.705 462.8C195.547 462.923 195.504 462.897 195.372 462.8L147.418 433.311C146.313 432.632 145.042 432.272 143.746 432.272C142.449 432.272 141.178 432.632 140.074 433.311L92.1196 462.818C91.9882 462.897 91.9531 462.923 91.7866 462.818C91.7126 462.78 91.656 462.716 91.6282 462.637C91.6005 462.559 91.6039 462.473 91.6376 462.397L104.678 407.362C104.975 406.112 104.923 404.804 104.527 403.582C104.132 402.359 103.408 401.269 102.434 400.43L59.7557 363.623C59.6505 363.535 59.5541 363.456 59.6418 363.185C59.7294 362.913 59.7995 362.948 59.931 362.931L115.948 358.409C117.233 358.298 118.462 357.836 119.501 357.072C120.54 356.308 121.348 355.273 121.837 354.079L143.413 301.84C143.483 301.691 143.509 301.621 143.72 301.621C143.93 301.621 143.956 301.691 144.026 301.84L165.655 354.079C166.148 355.273 166.961 356.308 168.005 357.069C169.049 357.829 170.283 358.287 171.57 358.391L227.587 362.913C227.719 362.913 227.797 362.913 227.876 363.167C227.955 363.421 227.876 363.518 227.736 363.605Z" fill="#DBA800" />
        </g>
        <defs>
          <filter id="login-blur-dark" x="0" y="0" width="582.548" height="540.548" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix" /><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" /><feGaussianBlur stdDeviation="22.8" result="effect1_foregroundBlur" />
          </filter>
        </defs>
      </svg>
    </div>

    <!-- Mobile: logo centered in hero, form pinned to bottom -->
    <!-- Desktop: everything centered as one group -->
    <!-- Back button -->
    <button
      type="button"
      class="absolute left-4 top-4 z-20 flex size-10 cursor-pointer items-center justify-center rounded-full text-[#232b37]/60 transition-colors hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
      aria-label="Go back"
      @click="router.back()"
    >
      <PhArrowLeft :size="20" />
    </button>

    <div class="relative z-10 flex flex-1 flex-col px-5 pt-12 pb-0 lg:py-12">
      <!-- Logo + Wordmark -->
      <div class="flex flex-1 flex-col items-center justify-center lg:mb-10 lg:flex-none">
        <div class="flex items-center gap-3">
          <img
            src="/images/app-icon.svg"
            alt=""
            aria-hidden="true"
            class="h-12 w-12"
          >
          <span class="text-3xl font-bold text-[#232b37] dark:text-white">Fediway</span>
        </div>
      </div>

      <!-- Action card / bottom panel -->
      <div class="-mx-5 mt-auto w-[calc(100%+2.5rem)] bg-[#fefeff] px-5 py-8 dark:bg-[#232b37] lg:mx-auto lg:mt-0 lg:w-full lg:max-w-md lg:rounded-3xl lg:shadow-2xl">
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
          <InputGroup class="h-12 rounded-full">
            <InputGroupAddon>
              <PhGlobe :size="20" aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              id="instance-domain"
              v-model="instanceDomain"
              type="text"
              placeholder="Instance (e.g. mastodon.social)"
              aria-label="Mastodon instance domain"
              :aria-describedby="errorMessage ? 'login-error' : undefined"
              :aria-invalid="errorMessage ? true : undefined"
              required
              autocomplete="off"
              autocapitalize="none"
              spellcheck="false"
              class="h-12 text-base"
            />
          </InputGroup>

          <Button
            type="submit"
            :disabled="!canSignIn"
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
