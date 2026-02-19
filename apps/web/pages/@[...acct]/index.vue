<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import {
  AccountActions,
  AccountBio,
  AccountHeader,
  AccountStats,
  Timeline,
} from '@repo/ui';
import { useData } from '~/composables/useData';
import { useFollows } from '~/composables/useFollows';
import { useInteractions } from '~/composables/useInteractions';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

definePageMeta({ keepalive: true });

const route = useRoute();
const router = useRouter();
const { getAccountByAcct, getAccountStatuses, getProfileUrl } = useData();
const { toggleFavourite, toggleReblog, toggleBookmark, withOverridesAll } = useInteractions();
const { toggleFollow, getRelationship } = useFollows();
const { open: openSendMessage } = useSendMessageModal();
const { open: openLightbox } = useMediaLightbox();

const acct = computed(() => {
  const param = route.params.acct;
  if (Array.isArray(param)) {
    return param.join('/');
  }
  return param ?? '';
});

const account = computed(() => acct.value ? getAccountByAcct(acct.value) : undefined);
const rawStatuses = computed(() => acct.value ? getAccountStatuses(acct.value) : []);
const statuses = computed(() => withOverridesAll(rawStatuses.value));
const relationship = computed(() => account.value ? getRelationship(account.value.id) : null);

function handleFollowToggle() {
  if (account.value) {
    toggleFollow(account.value.id);
  }
}

function handleStatusClick(statusId: string) {
  router.push(`/status/${statusId}`);
}

function handleReblog(statusId: string) {
  toggleReblog(statusId, rawStatuses.value);
}

function handleFavourite(statusId: string) {
  toggleFavourite(statusId, rawStatuses.value);
}

function handleBookmark(statusId: string) {
  toggleBookmark(statusId, rawStatuses.value);
}

function handleTagClick(tag: Tag) {
  router.push(`/tags/${tag.name}`);
}

function handleSendMessage(status: Status) {
  openSendMessage(status);
}

function handleMediaClick(attachments: MediaAttachment[], index: number) {
  openLightbox(attachments, index);
}
</script>

<template>
  <div class="w-full">
    <div v-if="account" class="w-full">
      <!-- Profile Header (banner + avatar) -->
      <AccountHeader :account="account" />

      <!-- Actions row (positioned to align with avatar row) -->
      <div class="px-4 pt-2 flex justify-end">
        <AccountActions
          :relationship="relationship"
          @follow="handleFollowToggle"
          @unfollow="handleFollowToggle"
        />
      </div>

      <!-- Profile Info Section -->
      <div class="px-4 pt-2 pb-4 border-b border-gray-200">
        <!-- Bio (includes name, handle, description) -->
        <AccountBio :account="account" class="mb-3" />

        <!-- Stats -->
        <AccountStats
          :statuses-count="account.statusesCount"
          :followers-count="account.followersCount"
          :following-count="account.followingCount"
        />
      </div>

      <!-- User's Statuses -->
      <Timeline
        :statuses="statuses"
        :loading="false"
        :has-more="false"
        :get-profile-url="(acct) => getProfileUrl(acct)"
        @reblog="handleReblog"
        @favourite="handleFavourite"
        @bookmark="handleBookmark"
        @send-message="handleSendMessage"
        @tag-click="handleTagClick"
        @status-click="handleStatusClick"
        @media-click="handleMediaClick"
      />
    </div>
    <div v-else class="p-8 text-center">
      <p class="text-gray-500">
        User not found
      </p>
    </div>
  </div>
</template>
