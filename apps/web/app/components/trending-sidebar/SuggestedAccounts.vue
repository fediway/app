<script setup lang="ts">
import { AccountListItem, Card, CardContent, CardFooter, CardHeader, CardTitle, FollowButton } from '@repo/ui';
import { useFollows } from '~/composables/useFollows';

const { getSuggestedAccounts } = useAccountData();
const { toggleFollow, isFollowing, hasRelationship, getRelationship, fetchRelationships } = useFollows();
const { getProfilePath } = useAccountData();

const { data: suggestedAccounts, error } = getSuggestedAccounts();

watch(suggestedAccounts, (accounts) => {
  if (accounts.length > 0) {
    fetchRelationships(accounts.map(a => a.id));
  }
}, { immediate: true });
</script>

<template>
  <Card v-if="!error && suggestedAccounts.length > 0" class="rounded-2xl border-border shadow-none">
    <CardHeader class="p-4 pb-0">
      <CardTitle class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Who to follow
      </CardTitle>
    </CardHeader>
    <CardContent class="p-0 pb-2">
      <AccountListItem
        v-for="account in suggestedAccounts.slice(0, 3)"
        :key="account.id"
        :account="account"
        :profile-url="getProfilePath(account.acct)"
        @profile-click="navigateTo(getProfilePath($event))"
      >
        <template #action>
          <FollowButton
            v-if="hasRelationship(account.id)"
            :is-following="isFollowing(account.id)"
            :requested="getRelationship(account.id).requested"
            size="sm"
            @follow="toggleFollow(account.id)"
            @unfollow="toggleFollow(account.id)"
          />
        </template>
      </AccountListItem>
    </CardContent>
    <CardFooter class="px-4 pb-4">
      <NuxtLink
        to="/explore/people"
        class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
      >
        See more
      </NuxtLink>
    </CardFooter>
  </Card>
</template>
