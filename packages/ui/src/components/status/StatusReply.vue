<script setup lang="ts">
import type { Status } from '@repo/types';
import { PhChatCircle, PhHeart, PhRepeat } from '@phosphor-icons/vue';
import AccountDisplayName from '../account/AccountDisplayName.vue';
import AccountHandle from '../account/AccountHandle.vue';
import Avatar from '../ui/avatar/Avatar.vue';
import RelativeTime from '../ui/relative-time/RelativeTime.vue';
import RichText from '../ui/rich-text/RichText.vue';

defineProps<{
  status: Status;
}>();

defineEmits<{
  click: [statusId: string];
  reply: [statusId: string];
  reblog: [statusId: string];
  favourite: [statusId: string];
  profileClick: [acct: string];
}>();
</script>

<template>
  <div
    class="cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors hover:bg-gray-50 active:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 dark:active:bg-gray-800"
    @click="$emit('click', status.id)"
  >
    <article class="px-4 py-3">
      <div class="flex gap-3">
        <a class="shrink-0" @click.stop="$emit('profileClick', status.account.acct)">
          <Avatar :src="status.account.avatar" :alt="status.account.displayName" size="sm" />
        </a>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-1 text-sm">
            <AccountDisplayName
              :name="status.account.displayName || status.account.username"
              :emojis="status.account.emojis"
              class="truncate text-sm"
              @click.stop="$emit('profileClick', status.account.acct)"
            />
            <AccountHandle :acct="status.account.acct" class="truncate text-sm" />
            <span class="text-gray-400">·</span>
            <RelativeTime :datetime="status.createdAt" class="text-gray-500" />
          </div>
          <RichText
            :content="status.content"
            :emojis="status.emojis"
            class="mt-1 text-gray-900 dark:text-gray-100"
          />

          <!-- Compact reply actions -->
          <div class="mt-2 flex gap-4 text-sm text-gray-500">
            <button
              type="button"
              class="flex items-center gap-1 hover:text-blue-500 active:text-blue-500"
              @click.stop="$emit('reply', status.id)"
            >
              <PhChatCircle :size="16" />
              <span v-if="status.repliesCount > 0">{{ status.repliesCount }}</span>
            </button>
            <button
              type="button"
              class="flex items-center gap-1 hover:text-green-500 active:text-green-500"
              @click.stop="$emit('reblog', status.id)"
            >
              <PhRepeat :size="16" />
              <span v-if="status.reblogsCount > 0">{{ status.reblogsCount }}</span>
            </button>
            <button
              type="button"
              class="flex items-center gap-1 hover:text-red-500 active:text-red-500"
              @click.stop="$emit('favourite', status.id)"
            >
              <PhHeart :size="16" />
              <span v-if="status.favouritesCount > 0">{{ status.favouritesCount }}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>
