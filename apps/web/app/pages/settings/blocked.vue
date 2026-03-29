<script setup lang="ts">
import type { Account } from '@repo/types';
import { useClient } from '@repo/api';
import { AccountListItem, Button, EmptyState, PageHeader, Skeleton, useToast } from '@repo/ui';

const client = useClient();
const { toast } = useToast();

const accounts = ref<Account[]>([]);
const isLoading = ref(true);
const showSkeleton = ref(false);
let skeletonTimer: ReturnType<typeof setTimeout> | undefined;

usePageHeader({ title: 'Blocked accounts' });

onMounted(async () => {
  skeletonTimer = setTimeout(() => {
    showSkeleton.value = true;
  }, 300);
  try {
    accounts.value = await client.rest.v1.blocks.list();
  }
  catch {
    // Failed to load
  }
  finally {
    clearTimeout(skeletonTimer);
    isLoading.value = false;
    showSkeleton.value = false;
  }
});

async function handleUnblock(accountId: string) {
  try {
    await client.rest.v1.accounts.$select(accountId).unblock();
    accounts.value = accounts.value.filter(a => a.id !== accountId);
    toast.success('Unblocked');
  }
  catch {
    toast.error('Failed to unblock');
  }
}
</script>

<template>
  <div class="w-full max-w-2xl">
    <PageHeader title="Blocked accounts" show-back class="lg:hidden" />

    <!-- Loading -->
    <div v-if="showSkeleton" class="space-y-2 p-4">
      <div v-for="i in 3" :key="i" class="flex items-center gap-3">
        <Skeleton class="size-10 rounded-full" />
        <div class="space-y-1.5">
          <Skeleton class="h-4 w-32" />
          <Skeleton class="h-3 w-20" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <EmptyState
      v-else-if="accounts.length === 0"
      title="No blocked accounts"
      description="Accounts you block won't be able to see your posts or interact with you."
      class="py-12"
    />

    <!-- List -->
    <div v-else>
      <AccountListItem
        v-for="account in accounts"
        :key="account.id"
        :account="account"
      >
        <template #action>
          <Button variant="muted" size="sm" @click="handleUnblock(account.id)">
            Unblock
          </Button>
        </template>
      </AccountListItem>
    </div>
  </div>
</template>
