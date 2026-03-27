<script setup lang="ts">
import type { Account, Status } from '@repo/types';
import { useAuth, useNotificationMarker } from '@repo/api';
import { MediaLightbox, ToastContainer, useToast } from '@repo/ui';
import { useBackButton } from '~/composables/useBackButton';
import { useConversationData } from '~/composables/useConversationData';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
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
const { shareStatus } = useConversationData();
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

async function handleSendMessage(data: { recipients: Account[]; message: string; status: Status }) {
  const recipient = data.recipients[0];
  if (!recipient)
    return;

  try {
    await shareStatus(recipient.acct, data.message, data.status);
    toast.success('Message sent');
    router.push('/messages');
  }
  catch {
    toast.error('Failed to send message');
  }
}

// Notification polling — check for new notifications every 60s
const { isAuthenticated } = useAuth();
const { fetchMarker, startPolling: startNotifPolling, stopPolling: stopNotifPolling } = useNotificationMarker();

onMounted(() => {
  initCapacitorBackButton();
  if (isAuthenticated.value) {
    fetchMarker();
    startNotifPolling(60_000);
  }
});

onUnmounted(() => {
  stopNotifPolling();
});

watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    fetchMarker();
    startNotifPolling(60_000);
  }
  else {
    stopNotifPolling();
  }
});
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Skip to content -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-hidden focus:ring-2 focus:ring-ring"
    >
      Skip to content
    </a>

    <!-- Route announcer for screen readers -->
    <AriaAnnouncer />

    <!-- Auth-only modals -->
    <ClientOnly>
      <template v-if="navigation.currentUser">
        <PostComposerModal
          :is-open="isOpen"
          :reply-to="replyingTo"
          @close="close"
          @post="handlePost"
        />

        <SendMessageModal
          :is-open="isSendMessageOpen"
          :status="statusToShare"
          @close="closeSendMessage"
          @send="handleSendMessage"
        />
      </template>

      <!-- Auth prompt (shown when logged-out user tries to interact) -->
      <AuthPromptModal />

      <!-- Media Lightbox -->
      <MediaLightbox
        :is-open="isLightboxOpen"
        :attachments="lightboxAttachments"
        :initial-index="lightboxIndex"
        @close="closeLightbox"
      />
    </ClientOnly>

    <!-- Mobile: push-style sidebar layout -->
    <div class="lg:hidden relative min-h-screen" style="overflow-x: clip;">
      <!-- Sidebar (off-screen left, revealed by push) -->
      <MobileSidebar
        class="fixed top-0 left-0 bottom-0 w-[280px] max-w-[80vw] transition-transform duration-250 ease-out"
        :class="navigation.isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      />

      <!-- Mobile content wrapper (pushed right when sidebar opens) -->
      <div
        class="flex flex-col min-h-screen transition-transform duration-250 ease-out bg-card"
        :class="navigation.isSidebarOpen ? 'translate-x-[280px]' : 'translate-x-0'"
      >
        <!-- Overlay to close sidebar when tapping pushed content -->
        <div
          v-if="navigation.isSidebarOpen"
          class="absolute inset-0 z-[200]"
          @click="navigation.closeSidebar()"
        />
        <MobileHeader v-if="isAuthenticated" />
        <main class="flex-1 pb-20">
          <slot />
        </main>
      </div>
      <!-- Footer outside transformed wrapper — fixed positioning needs viewport as containing block -->
      <MobileFooter />
    </div>

    <!-- Desktop Layout: page scrolls normally, sidebars + header stay fixed via sticky -->
    <div class="hidden lg:flex justify-center min-h-screen">
      <div class="w-full max-w-[1200px] lg:grid lg:grid-cols-[240px_minmax(0,650px)_280px] lg:gap-8 lg:px-4">
        <!-- Left Column: Menu Sidebar (desktop only) -->
        <nav aria-label="Main navigation" class="hidden lg:block">
          <div class="lg:sticky lg:top-0 lg:pt-14">
            <DesktopSidebar />
          </div>
        </nav>

        <!-- Center Column: Sticky header (with rounded corners) + Feed content -->
        <div class="min-w-0 lg:flex lg:min-h-screen lg:flex-col">
          <DesktopFeedHeader />
          <main
            id="main-content"
            ref="feedRef"
            class="bg-card pb-20 lg:flex-1 lg:border-x lg:border-border"
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
