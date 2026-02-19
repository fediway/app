<script setup lang="ts">
import type { Account } from '@repo/types';
import AccountDisplayName from '../account/AccountDisplayName.vue';
import AccountHandle from '../account/AccountHandle.vue';
import Avatar from '../primitives/Avatar.vue';
import RelativeTime from '../primitives/RelativeTime.vue';

interface Props {
  account: Account;
  createdAt: string;
  profileUrl?: string;
  /** Whether this is a boosted status (show smaller) */
  compact?: boolean;
}

withDefaults(defineProps<Props>(), {
  profileUrl: undefined,
  compact: false,
});
</script>

<template>
  <header class="flex items-start gap-3">
    <a v-if="profileUrl" :href="profileUrl" class="shrink-0">
      <Avatar
        :src="account.avatar"
        :alt="`${account.displayName}'s avatar`"
        :size="compact ? 'sm' : 'md'"
      />
    </a>
    <Avatar
      v-else
      :src="account.avatar"
      :alt="`${account.displayName}'s avatar`"
      :size="compact ? 'sm' : 'md'"
    />

    <div class="flex flex-col min-w-0 flex-1">
      <div class="flex items-baseline gap-2 flex-wrap">
        <AccountDisplayName
          :name="account.displayName || account.username"
          :emojis="account.emojis"
          :as-link="!!profileUrl"
          :href="profileUrl"
          :class="compact ? 'text-sm' : 'text-[15px]'"
        />
        <RelativeTime :datetime="createdAt" :class="compact ? 'text-xs' : 'text-sm'" />
      </div>
      <AccountHandle :acct="account.acct" :class="compact ? 'text-xs' : 'text-sm'" />
    </div>
  </header>
</template>
