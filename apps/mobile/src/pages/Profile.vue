<script setup lang="ts">
import type { FediwayStatus, Tag } from '@repo/types';
import { useAccount, useStatusActions, useStatusStore } from '@repo/api';
import { AccountBio, AccountStats, ProfileHeader, Status } from '@repo/ui';
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHaptics } from '../composables/useHaptics';
import { getProfileUrl } from '../composables/useStatusBridge';

defineOptions({ name: 'Profile' });

const LEADING_AT_RE = /^@/;

const route = useRoute();
const router = useRouter();
const { impact, notification } = useHaptics();

const accountData = useAccount();
const store = useStatusStore();
const actions = useStatusActions({
  onError: () => notification('error'),
});

const acct = computed(() => {
  const raw = route.params.acct as string;
  return raw?.replace(LEADING_AT_RE, '') ?? '';
});

const statuses = computed(() =>
  (accountData.statuses.value ?? []).map(s => (store.get(s.id) as typeof s) ?? s),
);

async function load() {
  if (!acct.value)
    return;
  try {
    await accountData.fetchByAcct(acct.value);
    const items = accountData.statuses.value;
    if (items && items.length > 0) {
      store.setMany(items as FediwayStatus[]);
    }
  }
  catch {
    // Client not ready yet (auth not initialized) — error ref handles UI
  }
}

onMounted(load);
watch(acct, load);

function handleStatusClick(id: string) {
  router.push(`/status/${id}`);
}

function handleProfileClick(profileAcct: string) {
  router.push(getProfileUrl(profileAcct));
}

function handleTagClick(tag: Tag) {
  router.push(`/tags/${encodeURIComponent(tag.name)}`);
}

async function handleFavourite(id: string) {
  impact('light');
  await actions.toggleFavourite(id);
}

async function handleReblog(id: string) {
  impact('medium');
  await actions.toggleReblog(id);
}

async function handleBookmark(id: string) {
  impact('light');
  await actions.toggleBookmark(id);
}

function handleBack() {
  router.back();
}
</script>

<template>
  <!-- Loading -->
  <div v-if="accountData.isLoading.value && !accountData.account.value" class="flex items-center justify-center py-20">
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Loading profile...
    </p>
  </div>

  <!-- Error -->
  <div v-else-if="accountData.error.value && !accountData.account.value" class="flex flex-col items-center justify-center gap-4 py-20">
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Couldn't load profile
    </p>
    <button class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium dark:bg-gray-800" @click="load">
      Try again
    </button>
  </div>

  <!-- Profile -->
  <div v-else-if="accountData.account.value" class="min-h-screen">
    <ProfileHeader
      :header-image="accountData.account.value.header"
      :avatar-src="accountData.account.value.avatar"
      :avatar-alt="accountData.account.value.displayName"
      @back="handleBack"
    />

    <div class="px-4 pb-4">
      <div class="mt-3">
        <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">
          {{ accountData.account.value.displayName }}
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          @{{ accountData.account.value.acct }}
        </p>
      </div>

      <div class="mt-3">
        <AccountBio :account="accountData.account.value" />
      </div>

      <div class="mt-3">
        <AccountStats
          :statuses-count="accountData.account.value.statusesCount"
          :followers-count="accountData.account.value.followersCount"
          :following-count="accountData.account.value.followingCount"
        />
      </div>
    </div>

    <!-- Statuses -->
    <div class="border-t border-gray-200 dark:border-gray-800">
      <div v-for="status in statuses" :key="status.id">
        <Status
          :status="status"
          :profile-url="getProfileUrl(status.account.acct)"
          @favourite="handleFavourite(status.reblog?.id ?? status.id)"
          @reblog="handleReblog(status.reblog?.id ?? status.id)"
          @bookmark="handleBookmark(status.reblog?.id ?? status.id)"
          @status-click="handleStatusClick"
          @profile-click="handleProfileClick"
          @tag-click="handleTagClick"
        />
      </div>
    </div>

    <!-- Empty statuses -->
    <div v-if="!accountData.isLoading.value && statuses.length === 0" class="py-12 text-center text-gray-500">
      <p>No posts yet</p>
    </div>
  </div>
</template>
