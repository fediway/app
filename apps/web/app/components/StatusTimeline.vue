<script setup lang="ts">
import type { Status } from '@repo/types';
import { EmptyState, Timeline } from '@repo/ui';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

defineProps<{
  statuses: Status[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  error?: Error | null;
  emptyTitle: string;
  emptyDescription: string;
}>();

const emit = defineEmits<{
  retry: [];
  loadMore: [];
}>();

const router = useRouter();
const { getProfilePath, getStatusPath } = useAccountData();
const { toggleFavourite, toggleReblog, handleBookmark, store } = useWebActions();
const { open: openSendMessage } = useSendMessageModal();
const { open: openLightbox } = useMediaLightbox();
</script>

<template>
  <EmptyState
    v-if="error"
    :title="error.message || 'Failed to load'"
    action-label="Try again"
    class="py-12"
    @action="emit('retry')"
  />

  <EmptyState
    v-else-if="!isLoading && statuses.length === 0"
    :title="emptyTitle"
    :description="emptyDescription"
    class="py-12"
  />

  <Timeline
    v-else
    :statuses="statuses"
    :loading="isLoading"
    :loading-more="isLoadingMore ?? false"
    :has-more="hasMore ?? false"
    :get-profile-url="(acct) => getProfilePath(acct)"
    :get-status="store.get"
    @reblog="(id) => toggleReblog(id)"
    @favourite="(id) => toggleFavourite(id)"
    @bookmark="(id) => handleBookmark(id)"
    @send-message="(s) => openSendMessage(s)"
    @tag-click="(tag) => router.push(`/tags/${tag}`)"
    @status-click="(id) => router.push(getStatusPath(id))"
    @profile-click="(acct) => router.push(getProfilePath(acct))"
    @media-click="(attachments, index) => openLightbox(attachments, index)"
    @load-more="emit('loadMore')"
  />
</template>
