<script setup lang="ts">
import type { MediaAttachment, Status as StatusType } from '@repo/types';
import type { ThreadPosition } from './thread';
import { PhArrowsClockwise } from '@phosphor-icons/vue';
import { computed } from 'vue';
import { cn } from '../../lib/utils';
import RelativeTime from '../ui/relative-time/RelativeTime.vue';
import StatusActions from './StatusActions.vue';
import StatusCard from './StatusCard.vue';
import StatusContent from './StatusContent.vue';
import StatusMedia from './StatusMedia.vue';
import StatusQuote from './StatusQuote.vue';
import StatusTags from './StatusTags.vue';
import { isConnectedAbove, isConnectedBelow } from './thread';
import ThreadAvatarColumn from './ThreadAvatarColumn.vue';
import { useCleanContent } from './useCleanContent';

interface Props {
  status: StatusType;
  /**
   * Position of this status within a thread. Defaults to `{ kind: 'standalone' }`.
   * Use `shapeThreadContext()` or `shapeFeedStatus()` to compute positions for
   * a list of statuses — never hand-author the position for each call site.
   */
  threadPosition?: ThreadPosition;
  profileUrl?: string;
  /** Show the reblog indicator row when this status is a reblog */
  showReblogIndicator?: boolean;
  /**
   * Render a small "Author" badge in the header. Set when this status is by
   * the same author as the focused `main` post — populated by `shapeThreadContext`.
   */
  isAuthorReply?: boolean;
  /** Show the bottom 1px separator. Auto-hidden when connected below. */
  showSeparator?: boolean;
  /** Hide the action bar (e.g. ancestor rendering in thread detail) */
  hideActions?: boolean;
  /** Hide the link preview card (e.g. item page where card is redundant) */
  hideCard?: boolean;
  /** Whether the user is authenticated (mutes actions when false) */
  authenticated?: boolean;
  /** Whether the current user authored this post */
  isOwnPost?: boolean;
  /** Position in feed (1-based) for aria-posinset */
  feedPosition?: number;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  threadPosition: () => ({ kind: 'standalone' }),
  profileUrl: undefined,
  showReblogIndicator: true,
  isAuthorReply: false,
  showSeparator: true,
  hideActions: false,
  hideCard: false,
  authenticated: true,
  isOwnPost: false,
  feedPosition: undefined,
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

const isReblog = computed(() => props.status.reblog !== null);
const displayStatus = computed(() => props.status.reblog ?? props.status);
const booster = computed(() => (isReblog.value ? props.status.account : null));
const hasAnimatedMedia = computed(() =>
  displayStatus.value.mediaAttachments.some(a => a.type === 'gifv' || a.type === 'video'),
);

const quote = computed(() => displayStatus.value.quote);
const quotedStatus = computed(() => {
  const q = quote.value;
  if (q && 'quotedStatus' in q && q.quotedStatus) {
    return q.quotedStatus;
  }
  return null;
});

const cleanedContent = useCleanContent(
  () => displayStatus.value.content,
  () => displayStatus.value.tags,
  () => !!quote.value,
);

const isRemoteUser = computed(() => displayStatus.value.account.acct.includes('@'));

const parentPreview = computed(() =>
  props.threadPosition.kind === 'reply-with-parent-preview' ? props.threadPosition.parent : null,
);
const mainConnectAbove = computed(() => isConnectedAbove(props.threadPosition));
const mainConnectBelow = computed(() => isConnectedBelow(props.threadPosition));

function getDomain(acct: string): string {
  const parts = acct.split('@');
  return parts.length > 1 ? parts[1]! : '';
}

function handleStatusClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (
    target.closest(
      'a, button, video, [role="button"], [data-video-id], [data-slot="status-actions"], [data-slot="button-action"]',
    )
  ) {
    return;
  }
  emit('statusClick', displayStatus.value.id);
}
</script>

<template>
  <div>
    <!-- Parent context preview (feed-only, rendered for `reply-with-parent-preview`) -->
    <article
      v-if="parentPreview"
      class="contain-layout-style-paint content-visibility-auto cursor-pointer transition-colors hover:bg-foreground/[0.03]"
      @click="emit('statusClick', parentPreview.id)"
    >
      <div class="flex gap-3 px-4">
        <ThreadAvatarColumn
          :src="parentPreview.account.avatar"
          :alt="parentPreview.account.displayName"
          :connect-below="true"
          @click="emit('profileClick', parentPreview.account.acct)"
        />
        <div class="min-w-0 flex-1 pt-3">
          <div class="flex items-baseline gap-1 text-base">
            <button
              type="button"
              class="truncate font-bold text-foreground hover:underline cursor-pointer"
              @click.stop="emit('profileClick', parentPreview.account.acct)"
            >
              {{ parentPreview.account.displayName || parentPreview.account.username }}
            </button>
            <button
              type="button"
              class="shrink truncate text-muted-foreground hover:underline cursor-pointer"
              @click.stop="emit('profileClick', parentPreview.account.acct)"
            >
              @{{ parentPreview.account.acct }}
            </button>
            <RelativeTime
              :datetime="parentPreview.createdAt"
              class="ml-auto shrink-0 text-muted-foreground"
            />
          </div>
          <StatusContent
            :content="parentPreview.content"
            :spoiler-text="parentPreview.spoilerText"
            :emojis="parentPreview.emojis"
            :mentions="parentPreview.mentions"
            :max-lines="4"
            @mention-click="emit('profileClick', $event)"
            @hashtag-click="emit('tagClick', $event)"
          />
        </div>
      </div>
    </article>

    <!-- Main status row -->
    <article
      :class="cn(
        'cursor-pointer transition-colors hover:bg-foreground/[0.03]',
        !hasAnimatedMedia && 'contain-layout-style-paint content-visibility-auto',
        props.class,
      )"
      :tabindex="feedPosition ? 0 : undefined"
      :aria-posinset="feedPosition"
      :aria-setsize="feedPosition ? -1 : undefined"
      :aria-label="feedPosition ? `Post by ${displayStatus.account.displayName || displayStatus.account.username}` : undefined"
      @click="handleStatusClick"
    >
      <div
        v-if="isReblog && showReblogIndicator && booster"
        class="flex items-center gap-3 px-4 pt-2 text-sm text-muted-foreground"
      >
        <div class="flex w-11 shrink-0 justify-end">
          <PhArrowsClockwise :size="16" class="text-green" />
        </div>
        <span class="truncate">{{ booster.displayName || booster.username }} reposted</span>
      </div>

      <div class="flex gap-3 px-4">
        <ThreadAvatarColumn
          :src="displayStatus.account.avatar"
          :alt="displayStatus.account.displayName"
          :connect-above="mainConnectAbove"
          :connect-below="mainConnectBelow"
          @click="emit('profileClick', displayStatus.account.acct)"
        />

        <div class="min-w-0 flex-1 py-3">
          <div class="flex items-baseline gap-1 mb-1 text-base">
            <button
              type="button"
              class="truncate font-bold text-foreground hover:underline cursor-pointer"
              @click.stop="emit('profileClick', displayStatus.account.acct)"
            >
              {{ displayStatus.account.displayName || displayStatus.account.username }}
            </button>
            <span
              v-if="isAuthorReply"
              class="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground"
              aria-label="Author of the focused post"
            >
              Author
            </span>
            <button
              type="button"
              class="shrink truncate text-muted-foreground hover:underline cursor-pointer"
              @click.stop="emit('profileClick', displayStatus.account.acct)"
            >
              @{{ displayStatus.account.acct }}
            </button>
            <RelativeTime
              :datetime="displayStatus.createdAt"
              class="ml-auto shrink-0 text-muted-foreground"
            />
          </div>

          <StatusContent
            :content="cleanedContent"
            :spoiler-text="displayStatus.spoilerText"
            :emojis="displayStatus.emojis"
            :mentions="displayStatus.mentions"
            :max-lines="8"
            @mention-click="emit('profileClick', $event)"
            @hashtag-click="emit('tagClick', $event)"
          />

          <StatusMedia
            v-if="displayStatus.mediaAttachments.length > 0"
            :attachments="displayStatus.mediaAttachments"
            :sensitive="displayStatus.sensitive"
            class="mt-3"
            @media-click="(attachment, index) => emit('mediaClick', displayStatus.mediaAttachments, index)"
          />

          <StatusCard
            v-if="displayStatus.card && !hideCard"
            :card="displayStatus.card"
            class="mt-3"
          />

          <StatusQuote
            v-if="quotedStatus"
            :status="quotedStatus"
            class="mt-3"
            @click="emit('statusClick', $event)"
            @profile-click="emit('profileClick', $event)"
            @tag-click="emit('tagClick', $event)"
          />

          <StatusTags
            v-if="displayStatus.tags.length > 0"
            :tags="displayStatus.tags"
            class="mt-2"
            @tag-click="emit('tagClick', $event)"
          />

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
            :is-own-post="isOwnPost"
            :is-remote-user="isRemoteUser"
            @reply="emit('reply', displayStatus.id)"
            @reblog="emit('reblog', displayStatus.id)"
            @favourite="emit('favourite', displayStatus.id)"
            @bookmark="emit('bookmark', displayStatus.id)"
            @share="emit('share', displayStatus.id)"
            @send-message="emit('sendMessage', displayStatus)"
            @copy-link="emit('copyLink', displayStatus.id)"
            @delete="emit('delete', displayStatus.id)"
            @mute="emit('mute', displayStatus.account.id)"
            @block="emit('block', displayStatus.account.id)"
            @block-domain="emit('blockDomain', getDomain(displayStatus.account.acct))"
            @report="emit('report', displayStatus.id)"
          />
        </div>
      </div>

      <div
        v-if="showSeparator && !mainConnectBelow"
        class="h-px w-full bg-border"
      />
    </article>
  </div>
</template>
