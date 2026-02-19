<script setup lang="ts">
import type { Account, Status } from '@repo/types';
import { MediaLightbox } from '@repo/ui';
import { useBackButton } from '~/composables/useBackButton';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { useMessages } from '~/composables/useMessages';
import { usePostComposer } from '~/composables/usePostComposer';
import { usePosts } from '~/composables/usePosts';
import { useSendMessageModal } from '~/composables/useSendMessageModal';
import { useTabNavigation } from '~/composables/useTabNavigation';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();
const { isOpen, replyingTo, close } = usePostComposer();
const { addPost } = usePosts();
const { shareStatus } = useMessages();
const {
  isOpen: isSendMessageOpen,
  statusToShare,
  close: closeSendMessage,
} = useSendMessageModal();
const {
  isOpen: isLightboxOpen,
  attachments: lightboxAttachments,
  initialIndex: lightboxIndex,
  close: closeLightbox,
} = useMediaLightbox();

// Tab navigation — router guards
const { onRouteChange, saveCurrentScroll, canGoBack } = useTabNavigation();

router.beforeEach(() => {
  saveCurrentScroll();
});

router.afterEach((to, from) => {
  onRouteChange(to.path, from.path);
});

// Back button — register handlers by priority
const { register: registerBackHandler, initCapacitorBackButton } = useBackButton();

// Priority 100: Modals
registerBackHandler(100, () => {
  if (isOpen.value) {
    close();
    return true;
  }
  if (isSendMessageOpen.value) {
    closeSendMessage();
    return true;
  }
  if (isLightboxOpen.value) {
    closeLightbox();
    return true;
  }
  return false;
});

// Priority 90: Mobile sidebar
registerBackHandler(90, () => {
  if (navigation.isSidebarOpen) {
    navigation.closeSidebar();
    return true;
  }
  return false;
});

// Priority 50: Tab navigation (go back within tab)
registerBackHandler(50, () => {
  if (canGoBack.value) {
    router.back();
    return true;
  }
  return false;
});

// Initialize Capacitor back button listener
initCapacitorBackButton();

function handlePost(data: { content: string; spoilerText: string; visibility: string }) {
  addPost({
    content: data.content,
    spoilerText: data.spoilerText,
    visibility: data.visibility,
    inReplyToId: replyingTo.value?.id ?? null,
    inReplyToAccountId: replyingTo.value?.account.id ?? null,
  });
}

function handleSendMessage(data: { recipients: Account[]; message: string; status: Status }) {
  const conversationId = shareStatus(data.recipients, data.message, data.status);
  router.push(`/messages/${conversationId}`);
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Post Composer Modal -->
    <PostComposerModal
      :is-open="isOpen"
      :reply-to="replyingTo"
      @close="close"
      @post="handlePost"
    />

    <!-- Send Message Modal -->
    <SendMessageModal
      :is-open="isSendMessageOpen"
      :status="statusToShare"
      @close="closeSendMessage"
      @send="handleSendMessage"
    />

    <!-- Media Lightbox -->
    <MediaLightbox
      :is-open="isLightboxOpen"
      :attachments="lightboxAttachments"
      :initial-index="lightboxIndex"
      @close="closeLightbox"
    />

    <!-- Mobile Navigation -->
    <MobileHeader class="hidden max-lg:block" />
    <MobileFooter class="hidden max-lg:block" />
    <MobileSidebar />

    <!-- Desktop Layout: 3 Column Grid -->
    <div class="hidden lg:flex justify-center min-h-screen">
      <div class="w-full max-w-[1200px] grid grid-cols-[240px_minmax(0,650px)_280px] gap-8 px-4">
        <!-- Left Column: Menu Sidebar -->
        <aside class="h-fit sticky top-4">
          <DesktopSidebar />
        </aside>

        <!-- Center Column: Main Feed -->
        <main class="min-w-0 bg-white dark:bg-gray-900 border-x border-gray-200 dark:border-gray-800 min-h-screen">
          <slot />
        </main>

        <!-- Right Column: Trending Sidebar -->
        <aside class="h-fit sticky top-4">
          <TrendingSidebar />
        </aside>
      </div>
    </div>

    <!-- Mobile Main Content -->
    <main class="block lg:hidden pt-14 pb-14 bg-white dark:bg-gray-900">
      <slot />
    </main>
  </div>
</template>
