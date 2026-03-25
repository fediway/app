<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import { EmptyState, PageHeader, StatusAncestor, Status as StatusComponent, StatusDetailMain } from '@repo/ui';
import { computed } from 'vue';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { usePostComposer } from '~/composables/usePostComposer';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

const HTML_TAG_RE = /<[^>]*>/g;

const route = useRoute();
const router = useRouter();

const { getStatusById, getStatusContext } = useStatusData();
const { getProfilePath, getStatusPath } = useAccountData();
const { toggleFavourite, toggleReblog, handleBookmark, handleCopyLink, getStoreStatus } = useWebActions();
const { open: openLightbox } = useMediaLightbox();
const { open: openComposer } = usePostComposer();
const { open: openSendMessage } = useSendMessageModal();

const statusId = computed(() => route.params.id as string);

const { data: rawStatus } = getStatusById(statusId.value);
const status = computed(() => getStoreStatus(rawStatus.value));
const { data: context } = getStatusContext(statusId.value);

// Set the desktop header — show post author info
usePageHeader({
  title: computed(() => status.value?.account.displayName || status.value?.account.username || 'Post'),
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

function handleShare(id: string) {
  const statusUrl = getStatusPath(id);
  if (navigator.share) {
    navigator.share({ url: `${window.location.origin}${statusUrl}` });
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

function handleStatusClick(id: string) {
  navigateToStatus(id);
}

function handleSendMessage(s: Status) {
  openSendMessage(s);
}

// Determine if a descendant's parent is directly above (previous item or main post)
function hasReplyAbove(reply: Status, index: number): boolean {
  if (!reply.inReplyToId)
    return false;
  // Parent is the main post and this is the first descendant
  if (reply.inReplyToId === status.value?.id)
    return false; // Main post handles its own line via StatusDetailMain
  // Parent is the previous descendant
  if (index > 0) {
    const prev = context.value.descendants[index - 1];
    if (prev && prev.id === reply.inReplyToId)
      return true;
  }
  return false;
}

// Determine if a descendant has a reply directly below it in the thread
function hasReplyBelow(index: number): boolean {
  const descendants = context.value.descendants;
  if (index >= descendants.length - 1)
    return false;
  const current = descendants[index];
  const next = descendants[index + 1];
  return !!next && !!current && next.inReplyToId === current.id;
}

// Find the reply parent for a descendant (for thread context)
// Skip if parent is the main post or already the previous item in the list
function getReplyParent(reply: Status, index?: number): Status | null {
  if (!reply.inReplyToId)
    return null;
  if (reply.inReplyToId === status.value?.id)
    return null;
  // If the parent is the previous descendant, it's already visible above — skip
  if (index != null && index > 0) {
    const prev = context.value.descendants[index - 1];
    if (prev && prev.id === reply.inReplyToId)
      return null;
  }
  const all = [...context.value.ancestors, ...(rawStatus.value ? [rawStatus.value] : []), ...context.value.descendants];
  return all.find(s => s.id === reply.inReplyToId) ?? null;
}
</script>

<template>
  <div class="w-full">
    <PageHeader title="Post" show-back class="lg:hidden" @back="goBack" />

    <ClientOnly>
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
          <div class="absolute left-8 bottom-0 top-0 w-0.5 bg-accent" />
        </div>

        <!-- Main (focused) status -->
        <StatusDetailMain
          :status="status"
          @reply="handleReply"
          @reblog="handleReblog"
          @favourite="handleFavourite"
          @bookmark="handleBookmark"
          @share="handleShare"
          @copy-link="handleCopyLink"
          @tag-click="handleTagClick"
          @profile-click="navigateToProfile"
          @media-click="handleMediaClick"
          @view-reblogs="id => router.push(`${route.path}/reblogs`)"
          @view-favourites="id => router.push(`${route.path}/favourites`)"
        />

        <!-- Descendants (replies) -->
        <StatusComponent
          v-for="(reply, index) in context.descendants"
          :key="reply.id"
          :status="reply"
          :profile-url="getProfilePath(reply.account.acct)"
          :has-reply-above="hasReplyAbove(reply, index)"
          :has-reply-below="hasReplyBelow(index)"
          :reply-parent="getReplyParent(reply, index)"
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
      </template>
    </ClientOnly>
  </div>
</template>
