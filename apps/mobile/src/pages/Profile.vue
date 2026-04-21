<script setup lang="ts">
import type { FediwayStatus } from '@repo/types';
import { PhUser, PhWarningCircle } from '@phosphor-icons/vue';
import { useAccount, useAuth, useStatusActions, useStatusStore } from '@repo/api';
import { EmptyState, PinnedSection, ProfileActions, ProfileHeader, ProfileInformation, Skeleton, Status } from '@repo/ui';
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHaptics } from '../composables/useHaptics';
import { getProfileUrl } from '../composables/useStatusBridge';

defineOptions({ name: 'Profile' });

const LEADING_AT_RE = /^@/;

const route = useRoute();
const router = useRouter();
const { impact, notification } = useHaptics();

const { currentUser: authUser } = useAuth();
const accountData = useAccount();
const store = useStatusStore();
const actions = useStatusActions({
  onError: () => notification('error'),
});

const acct = computed(() => {
  const raw = route.params.acct as string;
  return raw?.replace(LEADING_AT_RE, '') ?? '';
});

const isOwnProfile = computed(() => {
  if (!authUser.value || !accountData.account.value)
    return false;
  return authUser.value.acct === accountData.account.value.acct;
});

const pinnedStatuses = computed(() =>
  (accountData.pinnedStatuses.value ?? []).map(s => (store.get(s.id) as typeof s) ?? s),
);

const pinnedIds = computed(() => new Set(pinnedStatuses.value.map(s => s.id)));

const statuses = computed(() =>
  (accountData.statuses.value ?? [])
    .map(s => (store.get(s.id) as typeof s) ?? s)
    .filter(s => !pinnedIds.value.has(s.id)),
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

function handleTagClick(tagName: string) {
  router.push(`/tags/${encodeURIComponent(tagName)}`);
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

async function handleFollow() {
  impact('light');
  await accountData.follow();
}

async function handleUnfollow() {
  impact('light');
  await accountData.unfollow();
}
</script>

<template>
  <!-- Loading -->
  <div v-if="accountData.isLoading.value && !accountData.account.value" class="space-y-4 p-4">
    <Skeleton class="h-40 w-full rounded-lg" />
    <div class="flex items-center gap-3">
      <Skeleton class="size-16 rounded-full" />
      <div class="flex-1 space-y-2">
        <Skeleton class="h-5 w-32" />
        <Skeleton class="h-4 w-24" />
      </div>
    </div>
    <Skeleton class="h-20 w-full" />
  </div>

  <!-- Error -->
  <EmptyState
    v-else-if="accountData.error.value && !accountData.account.value"
    :icon="PhWarningCircle"
    title="Couldn't load profile"
    action-label="Try again"
    @action="load"
  />

  <!-- Profile -->
  <div v-else-if="accountData.account.value" class="min-h-screen">
    <ProfileHeader
      :header-image="accountData.account.value.header"
      :avatar-src="accountData.account.value.avatar"
      :avatar-alt="accountData.account.value.displayName"
      :follows-you="accountData.relationship.value?.followedBy ?? false"
      @back="router.back()"
    />

    <div class="pb-4">
      <ProfileInformation :account="accountData.account.value" class="mt-3" />

      <div class="mt-3">
        <ProfileActions
          :following="accountData.relationship.value?.following"
          :requested="accountData.relationship.value?.requested"
          :is-own-profile="isOwnProfile"
          @follow="handleFollow"
          @unfollow="handleUnfollow"
          @message="router.push('/messages')"
        />
      </div>
    </div>

    <!-- Statuses -->
    <div class="border-t border-gray-200 dark:border-gray-800">
      <PinnedSection
        :statuses="pinnedStatuses"
        @favourite="handleFavourite"
        @reblog="handleReblog"
        @bookmark="handleBookmark"
        @status-click="handleStatusClick"
        @profile-click="handleProfileClick"
        @tag-click="handleTagClick"
      />
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
    <EmptyState
      v-if="!accountData.isLoading.value && statuses.length === 0 && pinnedStatuses.length === 0"
      :icon="PhUser"
      title="No posts yet"
    />
  </div>
</template>
