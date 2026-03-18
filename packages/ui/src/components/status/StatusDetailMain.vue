<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import AccountDisplayName from '../account/AccountDisplayName.vue';
import AccountHandle from '../account/AccountHandle.vue';
import Avatar from '../primitives/Avatar.vue';
import FullTimestamp from '../primitives/FullTimestamp.vue';
import RichText from '../primitives/RichText.vue';
import StatusActions from './StatusActions.vue';
import StatusMedia from './StatusMedia.vue';
import StatusStats from './StatusStats.vue';
import StatusTags from './StatusTags.vue';

defineProps<{
  status: Status;
}>();

defineEmits<{
  reply: [statusId: string];
  reblog: [statusId: string];
  favourite: [statusId: string];
  bookmark: [statusId: string];
  share: [statusId: string];
  tagClick: [tag: Tag];
  profileClick: [acct: string];
  mediaClick: [attachments: MediaAttachment[], index: number];
}>();
</script>

<template>
  <article class="border-b border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30">
    <!-- Author info -->
    <div class="mb-4 px-4 pt-4">
      <a
        class="flex items-center gap-3 no-underline"
        @click="$emit('profileClick', status.account.acct)"
      >
        <Avatar :src="status.account.avatar" :alt="status.account.displayName" size="md" />
        <div>
          <AccountDisplayName
            :name="status.account.displayName || status.account.username"
            :emojis="status.account.emojis"
          />
          <AccountHandle :acct="status.account.acct" class="block text-sm" />
        </div>
      </a>
    </div>

    <!-- Media (full width) -->
    <StatusMedia
      v-if="status.mediaAttachments.length > 0"
      :attachments="status.mediaAttachments"
      :sensitive="status.sensitive"
      class="mb-4"
      @media-click="(att, idx) => $emit('mediaClick', status.mediaAttachments, idx)"
    />

    <div class="px-4">
      <!-- Content (larger text for detail view) -->
      <RichText
        :content="status.content"
        :emojis="status.emojis"
        class="mb-4 text-lg leading-relaxed text-gray-900 dark:text-gray-100"
      />

      <!-- Tags -->
      <div v-if="status.tags.length > 0" class="mb-4">
        <StatusTags :tags="status.tags" @tag-click="tag => $emit('tagClick', tag)" />
      </div>

      <!-- Full timestamp -->
      <div class="border-t border-gray-200 py-3 dark:border-gray-700">
        <FullTimestamp :datetime="status.createdAt" />
      </div>

      <!-- Stats bar -->
      <div class="border-t border-gray-200 dark:border-gray-700">
        <StatusStats
          :reblogs-count="status.reblogsCount"
          :favourites-count="status.favouritesCount"
        />
      </div>

      <!-- Actions -->
      <div class="border-t border-gray-200 py-2 dark:border-gray-700">
        <StatusActions
          :replies-count="status.repliesCount"
          :reblogs-count="status.reblogsCount"
          :favourites-count="status.favouritesCount"
          :favourited="status.favourited ?? false"
          :reblogged="status.reblogged ?? false"
          :bookmarked="status.bookmarked ?? false"
          :visibility="status.visibility"
          @reply="$emit('reply', status.id)"
          @reblog="$emit('reblog', status.id)"
          @favourite="$emit('favourite', status.id)"
          @bookmark="$emit('bookmark', status.id)"
          @share="$emit('share', status.id)"
        />
      </div>
    </div>
  </article>
</template>
