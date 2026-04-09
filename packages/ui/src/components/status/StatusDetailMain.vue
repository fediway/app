<script setup lang="ts">
import type { MediaAttachment, Status } from '@repo/types';
import AccountDisplayName from '../account/AccountDisplayName.vue';
import AccountHandle from '../account/AccountHandle.vue';
import Avatar from '../ui/avatar/Avatar.vue';
import FullTimestamp from '../ui/full-timestamp/FullTimestamp.vue';
import RichText from '../ui/rich-text/RichText.vue';
import StatusActions from './StatusActions.vue';
import StatusMedia from './StatusMedia.vue';
import StatusTags from './StatusTags.vue';
import { useCleanContent } from './useCleanContent';

const props = withDefaults(defineProps<{
  status: Status;
  /** Whether the user is authenticated (mutes actions when false) */
  authenticated?: boolean;
  /** Whether the current user authored this post */
  isOwnPost?: boolean;
}>(), {
  authenticated: true,
  isOwnPost: false,
});

const emit = defineEmits<{
  reply: [statusId: string];
  reblog: [statusId: string];
  favourite: [statusId: string];
  bookmark: [statusId: string];
  share: [statusId: string];
  copyLink: [statusId: string];
  sendMessage: [status: Status];
  delete: [statusId: string];
  tagClick: [tagName: string];
  profileClick: [acct: string];
  mediaClick: [attachments: MediaAttachment[], index: number];
}>();

const cleanedContent = useCleanContent(
  () => props.status.content,
  () => props.status.tags,
  () => !!props.status.quote,
);
</script>

<template>
  <article class="bg-card">
    <!-- Author info -->
    <div class="mb-3 px-4 pt-3">
      <button
        type="button"
        class="flex items-center gap-3 cursor-pointer"
        @click="emit('profileClick', status.account.acct)"
      >
        <Avatar :src="status.account.avatar" :alt="status.account.displayName" size="md" />
        <div class="text-left leading-tight">
          <AccountDisplayName
            :name="status.account.displayName || status.account.username"
            :emojis="status.account.emojis"
          />
          <AccountHandle :acct="status.account.acct" class="block text-sm" />
        </div>
      </button>
    </div>

    <div class="px-4">
      <!-- Media -->
      <StatusMedia
        v-if="status.mediaAttachments?.length > 0"
        :attachments="status.mediaAttachments"
        :sensitive="status.sensitive"
        class="mb-3"
        @media-click="(att, idx) => $emit('mediaClick', status.mediaAttachments, idx)"
      />

      <!-- Content (larger text for detail view) -->
      <RichText
        :content="cleanedContent"
        :emojis="status.emojis"
        :mentions="status.mentions"
        class="mb-2 text-lg leading-relaxed text-foreground"
        @mention-click="emit('profileClick', $event)"
        @hashtag-click="emit('tagClick', $event)"
      />

      <!-- Tags -->
      <div v-if="status.tags.length > 0" class="mb-2">
        <StatusTags :tags="status.tags" @tag-click="tag => $emit('tagClick', tag)" />
      </div>

      <!-- Timestamp + Visibility -->
      <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
        <FullTimestamp :datetime="status.createdAt" />
        <span>·</span>
        <span class="capitalize">{{ status.visibility }}</span>
      </div>

      <!-- Actions -->
      <div class="border-t border-border mt-2 pt-2" data-testid="detail-actions">
        <StatusActions
          :replies-count="status.repliesCount"
          :reblogs-count="status.reblogsCount"
          :favourites-count="status.favouritesCount"
          :favourited="status.favourited ?? false"
          :reblogged="status.reblogged ?? false"
          :bookmarked="status.bookmarked ?? false"
          :visibility="status.visibility"
          :authenticated="authenticated"
          :is-own-post="isOwnPost"
          @reply="$emit('reply', status.id)"
          @reblog="$emit('reblog', status.id)"
          @favourite="$emit('favourite', status.id)"
          @bookmark="$emit('bookmark', status.id)"
          @share="$emit('share', status.id)"
          @copy-link="$emit('copyLink', status.id)"
          @send-message="$emit('sendMessage', status)"
          @delete="$emit('delete', status.id)"
        />
      </div>
    </div>
  </article>
</template>
