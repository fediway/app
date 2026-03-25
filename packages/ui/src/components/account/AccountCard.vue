<script setup lang="ts">
import type { Account } from '@repo/types';
import { Avatar } from '../ui/avatar';
import { RichText } from '../ui/rich-text';
import AccountDisplayName from './AccountDisplayName.vue';
import AccountHandle from './AccountHandle.vue';

interface Props {
  account: Account;
  /** URL to the account's profile */
  profileUrl?: string;
  /** Whether to show the bio */
  showBio?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
}

withDefaults(defineProps<Props>(), {
  profileUrl: undefined,
  showBio: false,
  size: 'md',
});
</script>

<template>
  <div class="flex items-start gap-3">
    <a v-if="profileUrl" :href="profileUrl" class="shrink-0">
      <Avatar
        :src="account.avatar"
        :alt="`${account.displayName}'s avatar`"
        :size="size === 'sm' ? 'sm' : 'md'"
      />
    </a>
    <Avatar
      v-else
      :src="account.avatar"
      :alt="`${account.displayName}'s avatar`"
      :size="size === 'sm' ? 'sm' : 'md'"
    />

    <div class="flex flex-col min-w-0 flex-1">
      <AccountDisplayName
        :name="account.displayName || account.username"
        :emojis="account.emojis"
        :as-link="!!profileUrl"
        :href="profileUrl"
        class="truncate"
        :class="size === 'sm' ? 'text-sm' : 'text-base'"
      />
      <AccountHandle :acct="account.acct" class="truncate" :class="size === 'sm' ? 'text-xs' : 'text-sm'" />
      <RichText
        v-if="showBio && account.note"
        :content="account.note"
        :emojis="account.emojis"
        class="text-sm text-foreground mt-1 line-clamp-2"
      />
    </div>
  </div>
</template>
