<script setup lang="ts">
import type { Status } from '@repo/types';
import AccountDisplayName from '../account/AccountDisplayName.vue';
import AccountHandle from '../account/AccountHandle.vue';
import Avatar from '../ui/avatar/Avatar.vue';
import RelativeTime from '../ui/relative-time/RelativeTime.vue';
import RichText from '../ui/rich-text/RichText.vue';
import ThreadConnector from './ThreadConnector.vue';

defineProps<{
  status: Status;
  /** Show vertical connector line below this status */
  showConnector?: boolean;
}>();

defineEmits<{
  click: [statusId: string];
  profileClick: [acct: string];
}>();
</script>

<template>
  <div
    class="relative cursor-pointer transition-colors hover:bg-muted active:bg-muted"
    @click="$emit('click', status.id)"
  >
    <ThreadConnector
      v-if="showConnector"
      class="top-14 bottom-0"
    />

    <article class="px-4 py-3">
      <div class="flex gap-3">
        <a class="shrink-0" @click.stop="$emit('profileClick', status.account.acct)">
          <Avatar :src="status.account.avatar" :alt="status.account.displayName" size="sm" />
        </a>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1 text-sm">
            <AccountDisplayName
              :name="status.account.displayName || status.account.username"
              :emojis="status.account.emojis"
              class="truncate text-sm"
              @click.stop="$emit('profileClick', status.account.acct)"
            />
            <AccountHandle :acct="status.account.acct" class="truncate text-sm" />
            <span class="text-gray-400 dark:text-gray-500">·</span>
            <RelativeTime :datetime="status.createdAt" class="text-sm" />
          </div>
          <RichText
            :content="status.content"
            :emojis="status.emojis"
            class="mt-1 text-foreground"
          />
        </div>
      </div>
    </article>
  </div>
</template>
