<script setup lang="ts">
import type { Account, Status } from '@repo/types';
import { MediaLightbox, ToastContainer, useToast } from '@repo/ui';
import { useBackButton } from '~/composables/useBackButton';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { useMessages } from '~/composables/useMessages';
import { useNetworkStatus } from '~/composables/useNetworkStatus';
import { usePostComposer } from '~/composables/usePostComposer';
import { usePosts } from '~/composables/usePosts';
import { useSendMessageModal } from '~/composables/useSendMessageModal';
import { useTabNavigation } from '~/composables/useTabNavigation';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
useNetworkStatus();
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

// Initialize Capacitor back button listener (client-only to avoid SSR crash)

function handlePost(data: { content: string; spoilerText: string; visibility: string }) {
  addPost({
    content: data.content,
    spoilerText: data.spoilerText,
    visibility: data.visibility,
    inReplyToId: replyingTo.value?.id ?? null,
    inReplyToAccountId: replyingTo.value?.account.id ?? null,
  });
}

const { feedEl } = useFeedScroll();
const feedRef = feedEl;

const { toast } = useToast();

function handleSendMessage(data: { recipients: Account[]; message: string; status: Status }) {
  const conversationId = shareStatus(data.recipients, data.message, data.status);
  toast.success('Message sent');
  router.push(`/messages/${conversationId}`);
}

onMounted(() => {
  initCapacitorBackButton();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 lg:bg-gray-100 dark:bg-gray-950">
    <!-- Skip to content -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-hidden focus:ring-2 focus:ring-ring dark:focus:bg-gray-900"
    >
      Skip to content
    </a>

    <!-- Route announcer for screen readers -->
    <AriaAnnouncer />

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
    <MobileFooter class="hidden max-lg:block" />
    <MobileSidebar />

    <!-- Responsive Layout: page scrolls normally, sidebars + header stay fixed via sticky -->
    <div class="flex justify-center min-h-screen">
      <div class="w-full max-w-[1200px] lg:grid lg:grid-cols-[240px_minmax(0,650px)_280px] lg:gap-8 lg:px-4">
        <!-- Left Column: Menu Sidebar (desktop only) -->
        <nav aria-label="Main navigation" class="hidden lg:block">
          <div class="lg:sticky lg:top-0 lg:pt-14">
            <DesktopSidebar />
          </div>
        </nav>

        <!-- Center Column: Sticky header (with rounded corners) + Feed content -->
        <div class="min-w-0 min-h-screen">
          <DesktopFeedHeader />
          <main
            id="main-content"
            ref="feedRef"
            class="bg-white dark:bg-gray-900 pb-20 lg:border-x lg:border-border"
          >
            <slot />
          </main>
        </div>

        <!-- Right Column: Trending Sidebar (desktop only) -->
        <aside aria-label="Trending" class="hidden lg:block">
          <TrendingSidebarWrapper />
        </aside>
      </div>
    </div>

    <!-- Toast notifications -->
    <ToastContainer />
  </div>
</template>

<style scoped>
</style>

<style>
/* Hide in-page PageHeader on desktop — the layout header handles it */
@media (min-width: 1024px) {
  #main-content > * > header:first-child {
    display: none;
  }
}
</style>
