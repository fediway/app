<script setup lang="ts">
import type { MediaAttachment, Status } from '@repo/types';
import { useAuth } from '@repo/api';
import { DeletedStatusTombstone, EmptyState, PageHeader, QuickReply, shapeThreadContext, Status as StatusComponent, StatusDetailMain, ThreadCollapseNode, ThreadSkeleton } from '@repo/ui';
import { useMediaQuery } from '@vueuse/core';
import { computed, onUnmounted, ref, watch } from 'vue';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { useMobileReplyTarget } from '~/composables/useMobileReplyTarget';
import { usePostComposer } from '~/composables/usePostComposer';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

const HTML_TAG_RE = /<[^>]*>/g;

const route = useRoute();
const router = useRouter();

const { getStatusById, getStatusContext } = useStatusData();
const { getProfilePath, getStatusPath } = useAccountData();
const { toggleFavourite, toggleReblog, handleBookmark, handleCopyLink, handleShare, handleDelete, handleMute, handleBlock, handleBlockDomain, handleReport, getStoreStatus, store } = useWebActions();
const { open: openLightbox } = useMediaLightbox();
const { open: openComposer } = usePostComposer();
const { open: openSendMessage } = useSendMessageModal();
const { currentUser, isAuthenticated } = useAuth();
const { addPost } = usePosts();
const isDesktop = useMediaQuery('(min-width: 1024px)');
const { set: setReplyTarget, clear: clearReplyTarget } = useMobileReplyTarget();

const statusId = computed(() => route.params.id as string);

const { data: rawStatus, isLoading: isStatusLoading } = getStatusById(statusId.value);
const status = computed(() => getStoreStatus(rawStatus.value));
const { data: context } = getStatusContext(statusId.value);

// Seed the store so action toggles work
watch(rawStatus, (s) => {
  if (s)
    store.set(s as import('@repo/types').FediwayStatus);
}, { immediate: true });
watch(() => context.value.descendants, (descendants) => {
  if (descendants.length) {
    store.setMany(descendants as import('@repo/types').FediwayStatus[]);
  }
}, { immediate: true });

const isOwnPost = computed(() =>
  !!currentUser.value && !!status.value && currentUser.value.id === status.value.account.id,
);

// Set mobile footer reply target when the focused status is available
watch(status, (s) => {
  if (s)
    setReplyTarget(s as Status);
}, { immediate: true });

onUnmounted(() => {
  clearReplyTarget();
});

// Set the desktop header — show post author info
usePageHeader({
  title: computed(() => status.value?.account.displayName || status.value?.account.username || 'Post'),
  titleEmojis: computed(() => status.value?.account.emojis ?? []),
  subtitle: computed(() => status.value ? `@${status.value.account.acct}` : undefined),
  image: computed(() => status.value?.account.avatar),
});

// SEO meta tags for link previews
useSeoMeta({
  title: () => status.value
    ? `${status.value.account.displayName || status.value.account.username}: "${status.value.content.replace(HTML_TAG_RE, '').slice(0, 80)}"`
    : 'Post',
  ogTitle: () => status.value?.account.displayName || 'Post',
  ogDescription: () => status.value?.content.replace(HTML_TAG_RE, '').slice(0, 200) || '',
  ogImage: () => status.value?.mediaAttachments?.[0]?.previewUrl || status.value?.account.avatar || '',
  twitterCard: () => status.value?.mediaAttachments?.length ? 'summary_large_image' : 'summary',
});

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
  router.push(getStatusPath(id));
}

function navigateToProfile(acct: string) {
  router.push(getProfilePath(acct));
}

// Event handlers
function handleReblog(id: string) {
  toggleReblog(id);
}

function handleFavourite(id: string) {
  toggleFavourite(id);
}

function handleTagClick(tag: string) {
  router.push(`/tags/${tag}`);
}

function handleReply(id: string) {
  const all = [...context.value.ancestors, ...(rawStatus.value ? [rawStatus.value] : []), ...context.value.descendants];
  const target = all.find(s => s.id === id) ?? rawStatus.value;
  if (target)
    openComposer(target);
}

// Quick reply — inline reply to the focused status
const isQuickReplying = ref(false);

function handleQuickReply(content: string) {
  if (!status.value)
    return;
  isQuickReplying.value = true;

  addPost({
    content,
    inReplyToId: status.value.id,
    inReplyToAccountId: status.value.account.id,
    visibility: status.value.visibility,
  });

  isQuickReplying.value = false;
  // Refresh context to show the new reply
  // The optimistic update should handle this, but refetch for safety
}

function handleExpandComposer() {
  if (status.value)
    openComposer(status.value);
}

function handleMediaClick(_attachments: MediaAttachment[], index: number) {
  if (status.value) {
    openLightbox(status.value.mediaAttachments, index);
  }
}

function handleStatusClick(id: string) {
  navigateToStatus(id);
}

function handleSendMessage(s: Status) {
  openSendMessage(s);
}

const expandedCollapseKeys = ref<Set<string>>(new Set());

// Reset expansion state when navigating to a different status.
watch(statusId, () => {
  expandedCollapseKeys.value = new Set();
});

const shapedThread = computed(() => {
  if (!status.value) {
    return { ancestors: [], descendants: [] };
  }
  return shapeThreadContext({
    ancestors: context.value.ancestors,
    main: status.value,
    descendants: context.value.descendants,
    expandedKeys: expandedCollapseKeys.value,
  });
});

function expandCollapse(key: string) {
  expandedCollapseKeys.value = new Set([...expandedCollapseKeys.value, key]);
}
</script>

<template>
  <div class="w-full">
    <PageHeader title="Post" show-back class="lg:hidden" @back="goBack" />

    <ClientOnly>
      <!-- Loading skeleton — thread-shaped so the page doesn't visually shift on load -->
      <ThreadSkeleton v-if="isStatusLoading && !status" :ancestors="1" :descendants="3" />

      <!-- Not found state (only after loading finishes) -->
      <EmptyState
        v-else-if="!status"
        title="Post not found"
        description="This post may have been deleted or is not available."
        action-label="Go to Home"
        class="py-12"
        @action="router.push('/')"
      />

      <template v-else>
        <!-- Ancestors (parent chain) — Status, ThreadCollapseNode, or DeletedStatusTombstone -->
        <template v-for="item in shapedThread.ancestors" :key="item.kind === 'status' ? item.status.id : item.key">
          <StatusComponent
            v-if="item.kind === 'status'"
            :status="item.status"
            :thread-position="item.position"
            :is-author-reply="item.isAuthorReply"
            :hide-actions="true"
            :show-separator="false"
            @status-click="handleStatusClick"
            @profile-click="navigateToProfile"
            @tag-click="handleTagClick"
            @media-click="handleMediaClick"
          />
          <ThreadCollapseNode
            v-else-if="item.kind === 'collapse'"
            :accounts="item.accounts"
            :hidden-count="item.hiddenCount"
            :thread-position="item.position"
            :show-separator="false"
            @expand="expandCollapse(item.key)"
          />
          <DeletedStatusTombstone
            v-else
            :reason="item.reason"
            :thread-position="item.position"
            :show-separator="false"
          />
        </template>

        <!-- Main (focused) status -->
        <StatusDetailMain
          :status="status"
          :is-own-post="isOwnPost"
          @reply="handleReply"
          @reblog="handleReblog"
          @favourite="handleFavourite"
          @bookmark="handleBookmark"
          @share="handleShare"
          @copy-link="handleCopyLink"
          @send-message="handleSendMessage"
          @delete="handleDelete"
          @mute="handleMute"
          @block="handleBlock"
          @block-domain="handleBlockDomain"
          @report="handleReport"
          @tag-click="handleTagClick"
          @profile-click="navigateToProfile"
          @status-click="handleStatusClick"
          @media-click="handleMediaClick"
        />

        <!-- Quick Reply (desktop only — mobile uses the bottom nav reply bar) -->
        <QuickReply
          v-if="isAuthenticated && isDesktop"
          :avatar-src="currentUser?.avatar"
          :avatar-alt="currentUser?.displayName || currentUser?.username"
          :reply-to-acct="status.account.acct"
          :disabled="isQuickReplying"
          :submitting="isQuickReplying"
          @submit="handleQuickReply"
          @expand="handleExpandComposer"
        />

        <!-- Descendants (replies) — Status, ThreadCollapseNode, or DeletedStatusTombstone -->
        <template v-for="item in shapedThread.descendants" :key="item.kind === 'status' ? item.status.id : item.key">
          <StatusComponent
            v-if="item.kind === 'status'"
            :status="item.status"
            :thread-position="item.position"
            :is-author-reply="item.isAuthorReply"
            :profile-url="getProfilePath(item.status.account.acct)"
            @reply="handleReply"
            @reblog="handleReblog"
            @favourite="handleFavourite"
            @bookmark="handleBookmark"
            @share="handleShare"
            @copy-link="handleCopyLink"
            @tag-click="handleTagClick"
            @status-click="handleStatusClick"
            @profile-click="navigateToProfile"
            @media-click="handleMediaClick"
            @send-message="handleSendMessage"
          />
          <ThreadCollapseNode
            v-else-if="item.kind === 'collapse'"
            :accounts="item.accounts"
            :hidden-count="item.hiddenCount"
            :thread-position="item.position"
            :show-separator="false"
            @expand="expandCollapse(item.key)"
          />
          <DeletedStatusTombstone
            v-else
            :reason="item.reason"
            :thread-position="item.position"
            :show-separator="false"
          />
        </template>
      </template>
    </ClientOnly>
  </div>
</template>
