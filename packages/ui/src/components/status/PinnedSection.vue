<script setup lang="ts">
import type { MediaAttachment, Status as StatusType } from '@repo/types';
import { computed } from 'vue';
import PinnedOverflowCard from './PinnedOverflowCard.vue';
import Status from './Status.vue';

interface Props {
  statuses: StatusType[];
  profileUrl?: string;
  currentUserId?: string;
  authenticated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  profileUrl: undefined,
  currentUserId: undefined,
  authenticated: true,
});

const emit = defineEmits<{
  reply: [statusId: string];
  reblog: [statusId: string];
  favourite: [statusId: string];
  bookmark: [statusId: string];
  share: [statusId: string];
  sendMessage: [status: StatusType];
  copyLink: [statusId: string];
  delete: [statusId: string];
  mute: [accountId: string];
  block: [accountId: string];
  blockDomain: [domain: string];
  report: [statusId: string];
  tagClick: [tagName: string];
  profileClick: [accountId: string];
  statusClick: [statusId: string];
  mediaClick: [attachments: MediaAttachment[], index: number];
}>();

const primary = computed(() => props.statuses[0]);
const overflow = computed(() => props.statuses.slice(1));

const isPrimaryOwnPost = computed(() =>
  props.currentUserId != null && primary.value?.account.id === props.currentUserId,
);
</script>

<template>
  <div v-if="primary">
    <Status
      :status="primary"
      :profile-url="profileUrl"
      :is-pinned="true"
      :is-own-post="isPrimaryOwnPost"
      :authenticated="authenticated"
      :show-separator="overflow.length === 0"
      @reply="(id) => emit('reply', id)"
      @reblog="(id) => emit('reblog', id)"
      @favourite="(id) => emit('favourite', id)"
      @bookmark="(id) => emit('bookmark', id)"
      @share="(id) => emit('share', id)"
      @send-message="(s) => emit('sendMessage', s)"
      @copy-link="(id) => emit('copyLink', id)"
      @delete="(id) => emit('delete', id)"
      @mute="(id) => emit('mute', id)"
      @block="(id) => emit('block', id)"
      @block-domain="(d) => emit('blockDomain', d)"
      @report="(id) => emit('report', id)"
      @tag-click="(t) => emit('tagClick', t)"
      @profile-click="(a) => emit('profileClick', a)"
      @status-click="(id) => emit('statusClick', id)"
      @media-click="(a, i) => emit('mediaClick', a, i)"
    />

    <div
      v-if="overflow.length > 0"
      class="flex gap-3 overflow-x-auto pl-[72px] pr-4 py-3 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-2 md:overflow-visible md:snap-none"
    >
      <PinnedOverflowCard
        v-for="s in overflow"
        :key="s.id"
        :status="s"
        class="w-[220px] shrink-0 snap-start md:w-full md:shrink"
        @click="(id) => emit('statusClick', id)"
      />
    </div>
  </div>
</template>
