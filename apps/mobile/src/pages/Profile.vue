<script setup lang="ts">
import type { Tag } from '@repo/types';
import { AccountBio, AccountStats, ProfileHeader, Status } from '@repo/ui';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useData } from '../composables/useData';
import { useInteractions } from '../composables/useInteractions';

defineOptions({ name: 'Profile' });

const LEADING_AT_RE = /^@/;

const route = useRoute();
const router = useRouter();
const { getAccountByAcct, getAccountStatuses, getProfileUrl } = useData();
const { toggleFavourite, toggleReblog, toggleBookmark, withOverridesAll } = useInteractions();

const acct = computed(() => {
  const raw = route.params.acct as string;
  return raw?.replace(LEADING_AT_RE, '') ?? '';
});

const account = computed(() => getAccountByAcct(acct.value));
const statuses = computed(() => withOverridesAll(getAccountStatuses(acct.value)));

function handleStatusClick(id: string) {
  router.push(`/status/${id}`);
}

function handleProfileClick(profileAcct: string) {
  router.push(getProfileUrl(profileAcct));
}

function handleTagClick(tag: Tag) {
  router.push(`/tags/${encodeURIComponent(tag.name)}`);
}

function handleFavourite(id: string) {
  toggleFavourite(id, statuses.value);
}

function handleReblog(id: string) {
  toggleReblog(id, statuses.value);
}

function handleBookmark(id: string) {
  toggleBookmark(id, statuses.value);
}

function handleBack() {
  router.back();
}
</script>

<template>
  <div v-if="account" class="min-h-screen">
    <ProfileHeader
      :header-image="account.header"
      :avatar-src="account.avatar"
      :avatar-alt="account.displayName"
      @back="handleBack"
    />

    <div class="px-4 pb-4">
      <!-- Name & handle -->
      <div class="mt-3">
        <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">
          {{ account.displayName }}
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          @{{ account.acct }}
        </p>
      </div>

      <!-- Bio -->
      <div class="mt-3">
        <AccountBio :account="account" />
      </div>

      <!-- Stats -->
      <div class="mt-3">
        <AccountStats
          :statuses-count="account.statusesCount"
          :followers-count="account.followersCount"
          :following-count="account.followingCount"
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
  </div>

  <div v-else class="flex items-center justify-center py-20">
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Loading profile...
    </p>
  </div>
</template>
