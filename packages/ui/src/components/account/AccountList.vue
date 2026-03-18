<script setup lang="ts">
import type { Account } from '@repo/types';
import { EmptyState } from '../ui/empty-state';
import { Skeleton } from '../ui/skeleton';
import AccountListItem from './AccountListItem.vue';

withDefaults(defineProps<{
  accounts: Account[];
  showBio?: boolean;
  limit?: number;
  showSeeMore?: boolean;
  loading?: boolean;
  hasMore?: boolean;
  error?: string;
}>(), {
  showBio: false,
  limit: undefined,
  showSeeMore: false,
  loading: false,
  hasMore: false,
  error: undefined,
});

defineEmits<{
  accountClick: [acct: string];
  loadMore: [];
  retry: [];
  seeMore: [];
}>();
</script>

<template>
  <!-- Loading skeleton -->
  <div v-if="loading && accounts.length === 0" class="divide-y divide-gray-100 dark:divide-gray-800">
    <div v-for="i in 3" :key="i" class="flex items-center gap-3 px-4 py-3">
      <Skeleton class="size-10 rounded-full" />
      <div class="flex-1 space-y-2">
        <Skeleton class="h-4 w-1/3" />
        <Skeleton class="h-3 w-1/4" />
      </div>
    </div>
  </div>

  <!-- Error state -->
  <EmptyState
    v-else-if="error"
    :title="error"
    action-label="Try again"
    @action="$emit('retry')"
  />

  <!-- Account list -->
  <template v-else-if="accounts.length > 0">
    <div class="divide-y divide-gray-100 dark:divide-gray-800">
      <AccountListItem
        v-for="account in (limit ? accounts.slice(0, limit) : accounts)"
        :key="account.id"
        :account="account"
        :show-bio="showBio"
        @click="acct => $emit('accountClick', acct)"
      >
        <template v-if="$slots['item-action']" #action="{ account: acc }">
          <slot name="item-action" :account="acc" />
        </template>
        <template v-if="$slots['item-meta']" #meta="{ account: acc }">
          <slot name="item-meta" :account="acc" />
        </template>
      </AccountListItem>
    </div>

    <!-- See more link -->
    <div v-if="showSeeMore" class="px-4 py-3">
      <button
        class="text-sm text-gray-500 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:text-gray-200"
        @click="$emit('seeMore')"
      >
        See more
      </button>
    </div>

    <!-- Load more -->
    <div v-if="hasMore" class="flex justify-center py-4">
      <Skeleton v-if="loading" class="h-8 w-24 rounded-full" />
    </div>
  </template>

  <!-- Empty state -->
  <EmptyState v-else title="No accounts" />
</template>
