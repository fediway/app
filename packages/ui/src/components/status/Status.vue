<script setup lang="ts">
import type { MediaAttachment, Status as StatusType } from '@repo/types';
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
import { useCleanContent } from './useCleanContent';

interface Props {
  status: StatusType;
  /** URL to the author's profile */
  profileUrl?: string;
  /** Whether to show the reblog indicator */
  showReblogIndicator?: boolean;
  /** Parent status for reply context (resolved by consumer) */
  replyParent?: StatusType | null;
  /** Show vertical thread connector above avatar */
  hasReplyAbove?: boolean;
  /** Show vertical thread connector below avatar */
  hasReplyBelow?: boolean;
  /** Show bottom separator line */
  showSeparator?: boolean;
  /** Hide the action bar */
  hideActions?: boolean;
  /** Whether the user is authenticated (mutes actions when false) */
  authenticated?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  profileUrl: undefined,
  showReblogIndicator: true,
  replyParent: null,
  hasReplyAbove: false,
  hasReplyBelow: false,
  showSeparator: true,
  hideActions: false,
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
  mute: [accountId: string];
  block: [accountId: string];
  blockDomain: [domain: string];
  report: [statusId: string];
  tagClick: [tagName: string];
  profileClick: [accountId: string];
  statusClick: [statusId: string];
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

// Clean content: strip ActivityPub artifacts
const cleanedContent = useCleanContent(
  () => displayStatus.value.content,
  () => displayStatus.value.tags,
  () => !!quotedStatus.value,
);

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
      <div class="flex gap-3 px-4 pt-3 pb-0">
        <div class="flex shrink-0 flex-col items-center self-stretch">
          <button type="button" class="shrink-0" @click.stop="emit('profileClick', replyParent.account.acct)">
            <Avatar :src="replyParent.account.avatar" :alt="replyParent.account.displayName" size="md" />
          </button>
          <div class="mt-1 w-0.5 flex-1 bg-foreground/20" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-baseline gap-1 text-base">
            <button type="button" class="truncate font-bold text-foreground hover:underline cursor-pointer" @click.stop="emit('profileClick', replyParent.account.acct)">
              {{ replyParent.account.displayName || replyParent.account.username }}
            </button>
            <button type="button" class="shrink truncate text-muted-foreground hover:underline cursor-pointer" @click.stop="emit('profileClick', replyParent.account.acct)">
              @{{ replyParent.account.acct }}
            </button>
            <RelativeTime :datetime="replyParent.createdAt" class="ml-auto shrink-0 text-muted-foreground" />
          </div>
          <div class="mt-0.5">
            <StatusContent
              :content="replyParent.content"
              :spoiler-text="replyParent.spoilerText"
              :emojis="replyParent.emojis"
              :mentions="replyParent.mentions"
              @mention-click="emit('profileClick', $event)"
              @hashtag-click="emit('tagClick', $event)"
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
        class="flex items-center gap-3 px-4 pt-2 text-sm text-muted-foreground"
      >
        <div class="flex w-11 shrink-0 justify-end">
          <PhArrowsClockwise :size="16" class="text-green" />
        </div>
        <span class="truncate">{{ booster.displayName || booster.username }} boosted</span>
      </div>

      <div class="flex gap-3 px-4 py-3" :class="{ 'pt-0': replyParent || hasReplyAbove, 'pt-1': isReblog && showReblogIndicator && booster }">
        <!-- Left: avatar + thread connector -->
        <div class="flex shrink-0 flex-col items-center" :class="{ 'self-stretch': hasReplyBelow }">
          <div v-if="replyParent || hasReplyAbove" class="w-0.5 h-3 bg-foreground/20" />
          <button type="button" class="shrink-0 cursor-pointer" @click.stop="emit('profileClick', displayStatus.account.acct)">
            <Avatar :src="displayStatus.account.avatar" :alt="displayStatus.account.displayName" size="md" />
          </button>
          <div v-if="hasReplyBelow" class="mt-1 w-0.5 flex-1 bg-foreground/20" />
        </div>

        <!-- Right: header + content + actions -->
        <div class="min-w-0 flex-1">
          <!-- Header row -->
          <div class="flex items-baseline gap-1 text-base">
            <button type="button" class="truncate font-bold text-foreground hover:underline cursor-pointer" @click.stop="emit('profileClick', displayStatus.account.acct)">
              {{ displayStatus.account.displayName || displayStatus.account.username }}
            </button>
            <button type="button" class="shrink truncate text-muted-foreground hover:underline cursor-pointer" @click.stop="emit('profileClick', displayStatus.account.acct)">
              @{{ displayStatus.account.acct }}
            </button>
            <RelativeTime :datetime="displayStatus.createdAt" class="ml-auto shrink-0 text-muted-foreground" />
          </div>

          <!-- Content -->
          <div class="mt-0.5">
            <StatusContent
              :content="cleanedContent"
              :spoiler-text="displayStatus.spoilerText"
              :emojis="displayStatus.emojis"
              :mentions="displayStatus.mentions"
              @mention-click="emit('profileClick', $event)"
              @hashtag-click="emit('tagClick', $event)"
            />
          </div>

          <!-- Media Attachments -->
          <StatusMedia
            v-if="displayStatus.mediaAttachments.length > 0"
            :attachments="displayStatus.mediaAttachments"
            :sensitive="displayStatus.sensitive"
            class="mt-3"
            @media-click="(attachment, index) => emit('mediaClick', displayStatus.mediaAttachments, index)"
          />

          <!-- Preview Card -->
          <StatusCard
            v-if="displayStatus.card"
            :card="displayStatus.card"
            class="mt-3"
          />

          <!-- Quoted Status -->
          <StatusQuote
            v-if="quotedStatus"
            :status="quotedStatus"
            class="mt-3"
            @click="emit('statusClick', $event)"
            @profile-click="emit('profileClick', $event)"
            @tag-click="emit('tagClick', $event)"
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
            class="mt-2"
            :replies-count="displayStatus.repliesCount"
            :reblogs-count="displayStatus.reblogsCount"
            :favourites-count="displayStatus.favouritesCount"
            :favourited="displayStatus.favourited ?? false"
            :reblogged="displayStatus.reblogged ?? false"
            :bookmarked="displayStatus.bookmarked ?? false"
            :visibility="displayStatus.visibility"
            :authenticated="authenticated"
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

      <!-- Separator (hidden when connected to reply below) -->
      <div v-if="showSeparator && !hasReplyBelow" class="h-px w-full bg-border" />
    </article>
  </div>
</template>
