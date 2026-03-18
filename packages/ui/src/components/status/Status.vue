<script setup lang="ts">
import type { MediaAttachment, Status as StatusType, Tag } from '@repo/types';
import { PhArrowsClockwise } from '@phosphor-icons/vue';
import { computed } from 'vue';
import { FeedItem } from '../feed';
import StatusActions from './StatusActions.vue';
import StatusCard from './StatusCard.vue';
import StatusContent from './StatusContent.vue';
import StatusMedia from './StatusMedia.vue';
import StatusQuote from './StatusQuote.vue';
import StatusTags from './StatusTags.vue';

interface Props {
  status: StatusType;
  /** URL to the author's profile */
  profileUrl?: string;
  /** Whether to show the reblog indicator */
  showReblogIndicator?: boolean;
  /** Parent status for reply context (resolved by consumer) */
  replyParent?: StatusType | null;
}

const props = withDefaults(defineProps<Props>(), {
  profileUrl: undefined,
  showReblogIndicator: true,
  replyParent: null,
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
  const target = event.target as HTMLElement;
  if (target.closest('a, button, [role="button"]')) {
    return;
  }
  emit('statusClick', displayStatus.value.id);
}
</script>

<template>
  <div>
    <!-- Reply parent context -->
    <FeedItem
      v-if="replyParent"
      :avatar-src="replyParent.account.avatar"
      :avatar-alt="`${replyParent.account.displayName}'s avatar`"
      :display-name="replyParent.account.displayName || replyParent.account.username"
      :handle="`@${replyParent.account.acct}`"
      :created-at="replyParent.createdAt"
      has-reply-below
      hide-actions
      :show-separator="false"
      class="cursor-pointer hover:bg-muted/50 transition-colors"
      @click="emit('statusClick', replyParent.id)"
    >
      <StatusContent
        :content="replyParent.content"
        :spoiler-text="replyParent.spoilerText"
        :emojis="replyParent.emojis"
      />
    </FeedItem>

    <!-- Main status -->
    <FeedItem
      :avatar-src="displayStatus.account.avatar"
      :avatar-alt="`${displayStatus.account.displayName}'s avatar`"
      :display-name="displayStatus.account.displayName || displayStatus.account.username"
      :handle="`@${displayStatus.account.acct}`"
      :created-at="displayStatus.createdAt"
      class="cursor-pointer hover:bg-muted/50 transition-colors"
      @click="handleStatusClick"
    >
      <!-- Reblog indicator -->
      <template #pre-header>
        <div
          v-if="isReblog && showReblogIndicator && booster"
          class="flex items-center gap-2 px-5 pt-2 text-sm text-foreground/60"
        >
          <PhArrowsClockwise :size="16" class="ml-[28px]" />
          <span>{{ booster.displayName || booster.username }} boosted</span>
        </div>
      </template>

      <!-- Content -->
      <StatusContent
        :content="displayStatus.content"
        :spoiler-text="displayStatus.spoilerText"
        :emojis="displayStatus.emojis"
      />

      <!-- Media Attachments -->
      <StatusMedia
        v-if="displayStatus.mediaAttachments.length > 0"
        :attachments="displayStatus.mediaAttachments"
        :sensitive="displayStatus.sensitive"
        class="mt-2"
        @media-click="(attachment, index) => emit('mediaClick', displayStatus.mediaAttachments, index)"
      />

      <!-- Preview Card -->
      <StatusCard
        v-if="displayStatus.card"
        :card="displayStatus.card"
        class="mt-2"
      />

      <!-- Quoted Status -->
      <StatusQuote
        v-if="quotedStatus"
        :status="quotedStatus"
        class="mt-2"
        @click="emit('quoteClick', $event)"
      />

      <!-- Hashtags -->
      <StatusTags
        v-if="displayStatus.tags.length > 0"
        :tags="displayStatus.tags"
        class="mt-2"
        @tag-click="emit('tagClick', $event)"
      />

      <!-- Custom action bar with dropdown menu -->
      <template #actions>
        <StatusActions
          class="mt-2 mb-1"
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
      </template>
    </FeedItem>
  </div>
</template>
