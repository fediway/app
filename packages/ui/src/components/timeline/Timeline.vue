<script setup lang="ts">
import type { MediaAttachment, Status as StatusType, Tag } from '@repo/types';
import Status from '../status/Status.vue';

interface Props {
  statuses: StatusType[];
  /** Loading state */
  loading?: boolean;
  /** Whether there are more statuses to load */
  hasMore?: boolean;
  /** Function to generate profile URL from account */
  getProfileUrl?: (acct: string) => string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  hasMore: true,
  getProfileUrl: undefined,
});

const emit = defineEmits<{
  reply: [statusId: string];
  reblog: [statusId: string];
  favourite: [statusId: string];
  bookmark: [statusId: string];
  share: [statusId: string];
  sendMessage: [status: StatusType];
  tagClick: [tag: Tag];
  loadMore: [];
  statusClick: [statusId: string];
  profileClick: [acct: string];
  mediaClick: [attachments: MediaAttachment[], index: number];
}>();

function getProfileUrlForStatus(status: StatusType): string | undefined {
  if (props.getProfileUrl) {
    const displayStatus = status.reblog ?? status;
    return props.getProfileUrl(displayStatus.account.acct);
  }
  return undefined;
}
</script>

<template>
  <div class="timeline">
    <!-- Status list -->
    <Status
      v-for="status in statuses"
      :key="status.id"
      :status="status"
      :profile-url="getProfileUrlForStatus(status)"
      @reply="emit('reply', $event)"
      @reblog="emit('reblog', $event)"
      @favourite="emit('favourite', $event)"
      @bookmark="emit('bookmark', $event)"
      @share="emit('share', $event)"
      @send-message="emit('sendMessage', $event)"
      @tag-click="emit('tagClick', $event)"
      @status-click="emit('statusClick', $event)"
      @media-click="(attachments, index) => emit('mediaClick', attachments, index)"
    />

    <!-- Loading indicator -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
    </div>

    <!-- Load more button -->
    <div v-else-if="hasMore && statuses.length > 0" class="flex justify-center py-4">
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        @click="emit('loadMore')"
      >
        Load more
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="!loading && statuses.length === 0" class="text-center py-12 text-gray-500">
      <p>No posts yet</p>
    </div>
  </div>
</template>
