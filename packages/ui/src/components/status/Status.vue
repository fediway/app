<script setup lang="ts">
import type { MediaAttachment, Status as StatusType, Tag } from '@repo/types';
import { PhArrowsClockwise } from '@phosphor-icons/vue';
import { computed } from 'vue';
import { cn } from '../../lib/utils';
import { Avatar } from '../ui/avatar';
import { RelativeTime } from '../ui/relative-time';
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
  /** Show vertical thread connector below avatar */
  hasReplyBelow?: boolean;
  /** Show bottom separator line */
  showSeparator?: boolean;
  /** Hide the action bar */
  hideActions?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  profileUrl: undefined,
  showReblogIndicator: true,
  replyParent: null,
  hasReplyBelow: false,
  showSeparator: true,
  hideActions: false,
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
    <article
      v-if="replyParent"
      class="contain-layout-style-paint cursor-pointer transition-colors hover:bg-muted/50"
      @click="emit('statusClick', replyParent.id)"
    >
      <div class="flex gap-2 px-5 py-3">
        <div class="flex shrink-0 flex-col items-center">
          <Avatar :src="replyParent.account.avatar" :alt="replyParent.account.displayName" size="md" />
          <div class="mt-1 w-0.5 flex-1 rounded-full bg-foreground/20" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-baseline gap-1 text-base">
            <span class="truncate font-bold text-foreground">{{ replyParent.account.displayName || replyParent.account.username }}</span>
            <span class="shrink truncate text-foreground/80">@{{ replyParent.account.acct }}</span>
            <RelativeTime :datetime="replyParent.createdAt" class="ml-auto shrink-0 text-foreground/60" />
          </div>
          <div class="mt-1">
            <StatusContent
              :content="replyParent.content"
              :spoiler-text="replyParent.spoilerText"
              :emojis="replyParent.emojis"
            />
          </div>
        </div>
      </div>
    </article>

    <!-- Main status -->
    <article
      :class="cn('contain-layout-style-paint cursor-pointer transition-colors hover:bg-muted/50', props.class)"
      @click="handleStatusClick"
    >
      <!-- Reblog indicator -->
      <div
        v-if="isReblog && showReblogIndicator && booster"
        class="flex items-center gap-2 px-5 pt-2 text-sm text-foreground/60"
      >
        <PhArrowsClockwise :size="16" class="ml-[28px] text-green" />
        <span>{{ booster.displayName || booster.username }} boosted</span>
      </div>

      <div class="flex gap-2 px-5 py-3">
        <!-- Left: avatar + thread connector -->
        <div class="flex shrink-0 flex-col items-center">
          <Avatar :src="displayStatus.account.avatar" :alt="displayStatus.account.displayName" size="md" />
          <div v-if="hasReplyBelow" class="mt-1 w-0.5 flex-1 rounded-full bg-foreground/20" />
        </div>

        <!-- Right: header + content + actions -->
        <div class="min-w-0 flex-1">
          <!-- Header row -->
          <div class="flex items-baseline gap-1 text-base">
            <span class="truncate font-bold text-foreground">{{ displayStatus.account.displayName || displayStatus.account.username }}</span>
            <span class="shrink truncate text-foreground/80">@{{ displayStatus.account.acct }}</span>
            <RelativeTime :datetime="displayStatus.createdAt" class="ml-auto shrink-0 text-foreground/60" />
          </div>

          <!-- Content -->
          <div class="mt-1">
            <StatusContent
              :content="displayStatus.content"
              :spoiler-text="displayStatus.spoilerText"
              :emojis="displayStatus.emojis"
            />
          </div>

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

          <!-- Actions -->
          <StatusActions
            v-if="!hideActions"
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
        </div>
      </div>

      <!-- Separator -->
      <div v-if="showSeparator" class="h-px w-full bg-border" />
    </article>
  </div>
</template>
