<script setup lang="ts">
import type { Account } from '@repo/types';
import AccountCard from './AccountCard.vue';

withDefaults(defineProps<{
  account: Account;
  /** URL to the account's profile */
  profileUrl?: string;
  /** Whether to show the bio */
  showBio?: boolean;
}>(), {
  profileUrl: undefined,
  showBio: false,
});

defineEmits<{
  profileClick: [acct: string];
}>();
</script>

<template>
  <div
    class="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted cursor-pointer"
    @click="$emit('profileClick', account.acct)"
  >
    <AccountCard
      :account="account"
      :profile-url="profileUrl"
      :show-bio="showBio"
      class="min-w-0 flex-1"
    />
    <div v-if="$slots.action" class="shrink-0" @click.stop>
      <slot name="action" />
    </div>
  </div>
</template>
