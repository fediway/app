<script setup lang="ts">
import type { Status } from '@repo/types';
import { useAuth } from '@repo/api';
import { PinnedSection } from '@repo/ui';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

defineProps<{
  statuses: Status[];
}>();

const router = useRouter();
const { getProfilePath, getStatusPath } = useAccountData();
const { toggleFavourite, toggleReblog, handleBookmark, handleCopyLink, handleShare, handleDelete, handleMute, handleBlock, handleBlockDomain, handleReport } = useWebActions();
const { open: openSendMessage } = useSendMessageModal();
const { open: openLightbox } = useMediaLightbox();
const { currentUser } = useAuth();
</script>

<template>
  <PinnedSection
    v-if="statuses.length > 0"
    :statuses="statuses"
    :current-user-id="currentUser?.id"
    @reblog="(id) => toggleReblog(id)"
    @favourite="(id) => toggleFavourite(id)"
    @bookmark="(id) => handleBookmark(id)"
    @share="(id) => handleShare(id)"
    @copy-link="(id) => handleCopyLink(id)"
    @delete="(id) => handleDelete(id)"
    @mute="(id) => handleMute(id)"
    @block="(id) => handleBlock(id)"
    @block-domain="(d) => handleBlockDomain(d)"
    @report="(id) => handleReport(id)"
    @send-message="(s) => openSendMessage(s)"
    @tag-click="(t) => router.push(`/tags/${t}`)"
    @status-click="(id) => router.push(getStatusPath(id))"
    @profile-click="(acct) => router.push(getProfilePath(acct))"
    @media-click="(attachments, index) => openLightbox(attachments, index)"
  />
</template>
