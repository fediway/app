<script setup lang="ts">
import type { AccountListUser } from '@repo/ui';
import { AccountList, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui';
import { computed } from 'vue';

const { getSuggestedAccounts } = useAccountData();
const { toggleFollow } = useFollows();

const { data: suggestedAccounts } = getSuggestedAccounts();
const suggestions = computed<AccountListUser[]>(() =>
  suggestedAccounts.value.slice(0, 3).map(account => ({
    displayName: account.displayName || account.username,
    handle: `@${account.acct}`,
    avatarSrc: account.avatar,
    avatarAlt: account.displayName,
    _accountId: account.id,
  })),
);

function handleFollow(handle: string) {
  const account = suggestedAccounts.value.find(a => `@${a.acct}` === handle);
  if (account) {
    toggleFollow(account.id);
  }
}
</script>

<template>
  <Card class="rounded-xl border-border shadow-none">
    <CardHeader class="p-4 pb-0">
      <CardTitle class="text-[13px] font-medium text-gray-500 dark:text-gray-400">
        Who to follow
      </CardTitle>
    </CardHeader>
    <CardContent class="p-4 pt-3">
      <AccountList
        :users="suggestions"
        class="-mx-5"
        @follow="handleFollow"
      />
    </CardContent>
    <CardFooter class="px-4 pb-4">
      <NuxtLink
        to="/explore/people"
        class="text-[13px] text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        See more
      </NuxtLink>
    </CardFooter>
  </Card>
</template>
