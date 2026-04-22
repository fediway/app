<script setup lang="ts">
import type { Account } from '@repo/types';
import { Avatar } from '../ui/avatar';
import { RichText } from '../ui/rich-text';
import AccountDisplayName from './AccountDisplayName.vue';
import AccountHandle from './AccountHandle.vue';

withDefaults(defineProps<Props>(), {
  profileUrl: undefined,
  showBio: false,
  size: 'md',
});

const emit = defineEmits<{
  mentionClick: [acct: string];
  hashtagClick: [tag: string];
}>();

interface Props {
  account: Account;
  /** URL to the account's profile */
  profileUrl?: string;
  /** Whether to show the bio */
  showBio?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
}
</script>

<template>
  <div class="flex items-start gap-3">
    <div class="shrink-0">
      <Avatar
        :src="account.avatar"
        :alt="`${account.displayName}'s avatar`"
        :size="size === 'sm' ? 'sm' : 'md'"
      />
    </div>

    <div class="flex flex-col min-w-0 flex-1">
      <AccountDisplayName
        :name="account.displayName || account.username"
        :emojis="account.emojis"
        class="truncate font-semibold text-foreground"
        :class="size === 'sm' ? 'text-sm' : 'text-base'"
      />
      <AccountHandle :acct="account.acct" class="truncate" :class="size === 'sm' ? 'text-xs' : 'text-sm'" />
      <RichText
        v-if="showBio && account.note"
        :content="account.note"
        :emojis="account.emojis"
        class="text-sm text-foreground mt-1 line-clamp-2"
        @mention-click="emit('mentionClick', $event)"
        @hashtag-click="emit('hashtagClick', $event)"
      />
    </div>
  </div>
</template>
