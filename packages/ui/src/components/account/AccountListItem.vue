<script setup lang="ts">
import type { Account } from '@repo/types';
import Avatar from '../ui/avatar/Avatar.vue';
import RichText from '../ui/rich-text/RichText.vue';
import AccountDisplayName from './AccountDisplayName.vue';
import AccountHandle from './AccountHandle.vue';

withDefaults(defineProps<{
  account: Account;
  showBio?: boolean;
  showStats?: boolean;
  size?: 'sm' | 'md';
}>(), {
  showBio: false,
  showStats: false,
  size: 'md',
});

defineEmits<{
  click: [acct: string];
}>();
</script>

<template>
  <div
    class="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
    @click="$emit('click', account.acct)"
  >
    <a class="shrink-0" @click.stop="$emit('click', account.acct)">
      <Avatar
        :src="account.avatar"
        :alt="account.displayName"
        :size="size === 'sm' ? 'sm' : 'md'"
      />
    </a>
    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <AccountDisplayName
            :name="account.displayName || account.username"
            :emojis="account.emojis"
            class="truncate block"
          />
          <AccountHandle :acct="account.acct" class="truncate block text-sm" />
        </div>
        <!-- Action slot (FollowButton, remove button, or nothing) -->
        <slot name="action" :account="account" />
      </div>
      <!-- Bio -->
      <RichText
        v-if="showBio && account.note"
        :content="account.note"
        :emojis="account.emojis"
        class="mt-1 text-sm text-gray-600 line-clamp-2 dark:text-gray-400"
      />
      <!-- Stats -->
      <div v-if="showStats" class="mt-2 flex items-center gap-4 text-sm text-gray-500">
        <span><strong class="text-gray-900 dark:text-gray-100">{{ account.followersCount?.toLocaleString() }}</strong> followers</span>
        <span><strong class="text-gray-900 dark:text-gray-100">{{ account.followingCount?.toLocaleString() }}</strong> following</span>
      </div>
      <!-- Meta slot (badges, extra info) -->
      <slot name="meta" :account="account" />
    </div>
  </div>
</template>
