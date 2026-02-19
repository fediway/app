<script setup lang="ts">
import type { MediaAttachment, Status as StatusType, Tag } from '@repo/types';
import { computed } from 'vue';
import StatusActions from './StatusActions.vue';
import StatusCard from './StatusCard.vue';
import StatusContent from './StatusContent.vue';
import StatusHeader from './StatusHeader.vue';
import StatusMedia from './StatusMedia.vue';
import StatusQuote from './StatusQuote.vue';
import StatusTags from './StatusTags.vue';

interface Props {
  status: StatusType;
  /** URL to the author's profile */
  profileUrl?: string;
  /** Whether to show the reblog indicator */
  showReblogIndicator?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  profileUrl: undefined,
  showReblogIndicator: true,
});

const emit = defineEmits<{
  reply: [statusId: string];
  reblog: [statusId: string];
  favourite: [statusId: string];
  bookmark: [statusId: string];
  share: [statusId: string];
  sendMessage: [status: StatusType];
  copyLink: [statusId: string];
  mute: [accountId: string];
  block: [accountId: string];
  blockDomain: [domain: string];
  report: [statusId: string];
  tagClick: [tag: Tag];
  profileClick: [accountId: string];
  statusClick: [statusId: string];
  quoteClick: [statusId: string];
  mediaClick: [attachments: MediaAttachment[], index: number];
}>();

// If this is a reblog, show the original status but indicate who boosted it
const isReblog = computed(() => props.status.reblog !== null);
const displayStatus = computed(() => props.status.reblog ?? props.status);
const booster = computed(() => isReblog.value ? props.status.account : null);

// Get quoted status if available (Quote has quotedStatus, ShallowQuote doesn't)
const quotedStatus = computed(() => {
  const quote = displayStatus.value.quote;
  if (quote && 'quotedStatus' in quote && quote.quotedStatus) {
    return quote.quotedStatus;
  }
  return null;
});

function getDomain(acct: string): string {
  const parts = acct.split('@');
  return parts.length > 1 ? parts[1]! : '';
}

function handleStatusClick(event: MouseEvent) {
  // Don't navigate if clicking on interactive elements
  const target = event.target as HTMLElement;
  if (target.closest('a, button, [role="button"]')) {
    return;
  }
  emit('statusClick', displayStatus.value.id);
}
</script>

<template>
  <article
    class="status border-b border-gray-200 py-4 last:border-b-0 last:mb-0 cursor-pointer hover:bg-gray-50 transition-colors"
    @click="handleStatusClick"
  >
    <!-- Reblog indicator -->
    <div
      v-if="isReblog && showReblogIndicator && booster"
      class="flex items-center gap-2 px-4 mb-2 text-sm text-gray-500"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
      <span>{{ booster.displayName || booster.username }} boosted</span>
    </div>

    <!-- Status Header -->
    <div class="px-4 mb-3">
      <StatusHeader
        :account="displayStatus.account"
        :created-at="displayStatus.createdAt"
        :profile-url="profileUrl"
      />
    </div>

    <!-- Media Attachments -->
    <StatusMedia
      v-if="displayStatus.mediaAttachments.length > 0"
      :attachments="displayStatus.mediaAttachments"
      :sensitive="displayStatus.sensitive"
      class="mb-3"
      @media-click="(attachment, index) => emit('mediaClick', displayStatus.mediaAttachments, index)"
    />

    <!-- Status Content -->
    <div class="px-4 mb-3">
      <StatusContent
        :content="displayStatus.content"
        :spoiler-text="displayStatus.spoilerText"
        :emojis="displayStatus.emojis"
      />
    </div>

    <!-- Preview Card -->
    <div v-if="displayStatus.card" class="px-4 mb-3">
      <StatusCard :card="displayStatus.card" />
    </div>

    <!-- Quoted Status -->
    <div v-if="quotedStatus" class="px-4 mb-3">
      <StatusQuote
        :status="quotedStatus"
        @click="emit('quoteClick', $event)"
      />
    </div>

    <!-- Hashtags -->
    <div v-if="displayStatus.tags.length > 0" class="px-4 mb-3">
      <StatusTags
        :tags="displayStatus.tags"
        @tag-click="emit('tagClick', $event)"
      />
    </div>

    <!-- Actions -->
    <div class="px-4">
      <StatusActions
        :replies-count="displayStatus.repliesCount"
        :reblogs-count="displayStatus.reblogsCount"
        :favourites-count="displayStatus.favouritesCount"
        :favourited="displayStatus.favourited ?? false"
        :reblogged="displayStatus.reblogged ?? false"
        :bookmarked="displayStatus.bookmarked ?? false"
        :visibility="displayStatus.visibility"
        @reply="emit('reply', displayStatus.id)"
        @reblog="emit('reblog', displayStatus.id)"
        @favourite="emit('favourite', displayStatus.id)"
        @bookmark="emit('bookmark', displayStatus.id)"
        @share="emit('share', displayStatus.id)"
        @send-message="emit('sendMessage', displayStatus)"
        @copy-link="emit('copyLink', displayStatus.id)"
        @mute="emit('mute', displayStatus.account.id)"
        @block="emit('block', displayStatus.account.id)"
        @block-domain="emit('blockDomain', getDomain(displayStatus.account.acct))"
        @report="emit('report', displayStatus.id)"
      />
    </div>
  </article>
</template>

<style scoped>
.status {
  contain: layout style paint;
}
</style>
