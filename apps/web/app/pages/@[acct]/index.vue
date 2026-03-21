<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import {
  Badge,
  EmptyState,
  ProfileActions,
  ProfileHeader,
  ProfileInformation,
  Timeline,
} from '@repo/ui';
import { useFollows } from '~/composables/useFollows';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

definePageMeta({ keepalive: true });

const route = useRoute();
const router = useRouter();
const { getAccountByAcct, getAccountStatuses, getProfilePath, getStatusPath } = useAccountData();
const { toggleFavourite, toggleReblog, handleBookmark, withStoreState, store } = useWebActions();
const { toggleFollow, getRelationship } = useFollows();
const { open: openSendMessage } = useSendMessageModal();
const { open: openLightbox } = useMediaLightbox();

const acct = computed(() => route.params.acct as string);

const { data: account } = getAccountByAcct(acct.value);
const { data: rawStatuses } = getAccountStatuses(acct.value);
const statuses = withStoreState(rawStatuses);
const relationship = computed(() => account.value ? getRelationship(account.value.id) : null);

function handleFollowToggle() {
  if (account.value) {
    toggleFollow(account.value.id);
  }
}

function handleStatusClick(statusId: string) {
  router.push(getStatusPath(statusId));
}

function handleReblog(statusId: string) {
  toggleReblog(statusId);
}

function handleFavourite(statusId: string) {
  toggleFavourite(statusId);
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
        @back="goBack"
      />

      <!-- Follows you badge (right-aligned below header) -->
      <div v-if="relationship?.followedBy" class="flex justify-end px-4 -mb-2">
        <Badge variant="muted">
          Follows you
        </Badge>
      </div>

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
        :get-profile-url="(acct) => getProfilePath(acct)"
        :get-status="store.get"
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
