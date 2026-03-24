<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import { useStatusStore } from '@repo/api';
import {
  EmptyState,
  ProfileActions,
  ProfileHeader,
  ProfileInformation,
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
const statusStore = useStatusStore();

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

function goBack() {
  if (window.history.length > 1) {
    router.back();
  }
  else {
    router.push('/');
  }
}
</script>

<template>
  <div class="w-full">
    <div v-if="account" class="w-full">
      <!-- Profile Header (banner + avatar + back) -->
      <ProfileHeader
        :header-image="account.header"
        :avatar-src="account.avatar"
        :avatar-alt="`${account.displayName}'s avatar`"
        :follows-you="relationship?.followedBy ?? false"
        @back="goBack"
      />

      <!-- Profile Info Section -->
      <ProfileInformation :account="account" />

      <!-- Actions row -->
      <div class="border-b border-gray-200 px-4 pb-4 dark:border-gray-800">
        <ProfileActions
          :following="relationship?.following ?? false"
          :requested="relationship?.requested ?? false"
          @follow="handleFollowToggle"
          @unfollow="handleFollowToggle"
        />
      </div>

      <!-- User's Statuses -->
      <Timeline
        :statuses="statuses"
        :loading="false"
        :has-more="false"
        :get-profile-url="(acct) => getProfileUrl(acct)"
        :get-status="statusStore.get"
        @reblog="handleReblog"
        @favourite="handleFavourite"
        @bookmark="handleBookmark"
        @send-message="handleSendMessage"
        @tag-click="handleTagClick"
        @status-click="handleStatusClick"
        @media-click="handleMediaClick"
      />
    </div>
    <EmptyState
      v-else
      title="User not found"
      description="This account may have been deleted or moved."
      action-label="Go home"
      class="py-12"
      @action="router.push('/')"
    />
  </div>
</template>
