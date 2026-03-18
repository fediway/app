<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import { EmptyState, PageHeader, StatusAncestor, Status as StatusComponent, StatusDetailMain } from '@repo/ui';
import { computed } from 'vue';
import { useData } from '~/composables/useData';
import { useInteractions } from '~/composables/useInteractions';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { usePostComposer } from '~/composables/usePostComposer';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

const route = useRoute();
const router = useRouter();

const { getStatusById, getStatusContext, getProfileUrl } = useData();
const { toggleFavourite, toggleReblog, toggleBookmark, withOverrides } = useInteractions();
const { open: openLightbox } = useMediaLightbox();
const { open: openComposer } = usePostComposer();
const { open: openSendMessage } = useSendMessageModal();

const statusId = computed(() => route.params.id as string);

const rawStatus = computed(() => getStatusById(statusId.value));
const status = computed(() => rawStatus.value ? withOverrides(rawStatus.value) : undefined);
const context = computed(() => getStatusContext(statusId.value));

// Navigation
function goBack() {
  if (window.history.length > 1) {
    router.back();
  }
  else {
    router.push('/');
  }
}

function navigateToStatus(id: string) {
  router.push(`/status/${id}`);
}

function navigateToProfile(acct: string) {
  router.push(getProfileUrl(acct));
}

// Event handlers
function handleReblog(id: string) {
  if (rawStatus.value)
    toggleReblog(id, [rawStatus.value]);
}

function handleFavourite(id: string) {
  if (rawStatus.value)
    toggleFavourite(id, [rawStatus.value]);
}

function handleBookmark(id: string) {
  if (rawStatus.value)
    toggleBookmark(id, [rawStatus.value]);
}

function handleShare(id: string) {
  if (navigator.share) {
    navigator.share({ url: `${window.location.origin}/status/${id}` });
  }
}

function handleTagClick(tag: Tag) {
  router.push(`/tags/${tag.name}`);
}

function handleReply(id: string) {
  const target = [...context.value.ancestors, rawStatus.value!, ...context.value.descendants].find(s => s.id === id) ?? rawStatus.value;
  if (target)
    openComposer(target);
}

function handleMediaClick(_attachments: MediaAttachment[], index: number) {
  if (status.value) {
    openLightbox(status.value.mediaAttachments, index);
  }
}

function handleStatusClick(statusId: string) {
  navigateToStatus(statusId);
}

function handleSendMessage(s: Status) {
  openSendMessage(s);
}

// Determine if a descendant has a reply directly below it in the thread
function hasReplyBelow(index: number): boolean {
  const descendants = context.value.descendants;
  if (index >= descendants.length - 1)
    return false;
  const current = descendants[index];
  const next = descendants[index + 1];
  return next.inReplyToId === current.id;
}

// Find the reply parent for a descendant (for thread context)
function getReplyParent(reply: Status): Status | null {
  if (!reply.inReplyToId)
    return null;
  // Check if parent is the main status
  if (reply.inReplyToId === status.value?.id)
    return null; // don't show reply parent for direct replies to main
  // Check ancestors and descendants
  const all = [...context.value.ancestors, ...(rawStatus.value ? [rawStatus.value] : []), ...context.value.descendants];
  return all.find(s => s.id === reply.inReplyToId) ?? null;
}
</script>

<template>
  <div class="w-full">
    <PageHeader title="Post" show-back @back="goBack" />

    <!-- Not found state -->
    <EmptyState
      v-if="!status"
      title="Post not found"
      description="This post may have been deleted or is not available."
      action-label="Go to Home"
      class="py-12"
      @action="router.push('/')"
    />

    <template v-else>
      <!-- Ancestors (parent chain) -->
      <StatusAncestor
        v-for="(ancestor, index) in context.ancestors"
        :key="ancestor.id"
        :status="ancestor"
        :show-connector="index < context.ancestors.length - 1 || !!status"
        @click="navigateToStatus"
        @profile-click="navigateToProfile"
      />

      <!-- Connector from last ancestor to main -->
      <div
        v-if="context.ancestors.length"
        class="relative h-3"
      >
        <div class="absolute left-8 bottom-0 top-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
      </div>

      <!-- Main (focused) status -->
      <StatusDetailMain
        :status="status"
        @reply="handleReply"
        @reblog="handleReblog"
        @favourite="handleFavourite"
        @bookmark="handleBookmark"
        @share="handleShare"
        @tag-click="handleTagClick"
        @profile-click="navigateToProfile"
        @media-click="handleMediaClick"
      />

      <!-- Descendants (replies) -->
      <StatusComponent
        v-for="(reply, index) in context.descendants"
        :key="reply.id"
        :status="reply"
        :profile-url="getProfileUrl(reply.account.acct)"
        :has-reply-below="hasReplyBelow(index)"
        :reply-parent="getReplyParent(reply)"
        @reply="handleReply"
        @reblog="handleReblog"
        @favourite="handleFavourite"
        @bookmark="handleBookmark"
        @share="handleShare"
        @tag-click="handleTagClick"
        @status-click="handleStatusClick"
        @profile-click="navigateToProfile"
        @media-click="handleMediaClick"
        @send-message="handleSendMessage"
      />
    </template>
  </div>
</template>
