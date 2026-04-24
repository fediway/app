<script setup lang="ts">
import { useAuth } from '@repo/api';
import { AccountCard, EmptyState, FollowButton, Skeleton } from '@repo/ui';
import { computed, watch } from 'vue';

const { getAllAccounts, getProfilePath } = useAccountData();
const { toggleFollow, isFollowing, hasRelationship, getRelationship, fetchRelationships } = useFollows();
const { isCurrentUser } = useAuth();

const { data: accounts, isLoading, error, refetch } = getAllAccounts();

// Batch-fetch relationships when accounts load (one API call instead of N)
watch(accounts, (accts) => {
  if (accts.length > 0) {
    fetchRelationships(accts.map(a => a.id));
  }
}, { immediate: true });

// Only show the list when both accounts and at least one relationship is ready
// Prevents flash where accounts render without Follow buttons, then re-render with them
const isReady = computed(() =>
  accounts.value.length > 0
  && accounts.value.some(a => hasRelationship(a.id)),
);
</script>

<template>
  <div>
    <ClientOnly>
      <EmptyState
        v-if="error"
        :title="error.message || 'Failed to load people'"
        action-label="Try again"
        class="py-12"
        @action="refetch()"
      />

      <EmptyState
        v-else-if="!isLoading && accounts.length === 0"
        title="No people to show"
        description="Check back later for suggestions."
        class="py-12"
      />

      <div v-else-if="!isReady" class="space-y-3 p-4">
        <div v-for="i in 5" :key="i" class="flex items-center gap-3">
          <Skeleton class="size-10 rounded-full" />
          <div class="flex-1 space-y-2">
            <Skeleton class="h-4 w-32" />
            <Skeleton class="h-3 w-48" />
          </div>
        </div>
      </div>

      <div v-else-if="isReady" class="divide-y divide-border">
        <div
          v-for="account in accounts"
          :key="account.id"
          class="cursor-pointer px-4 py-3 transition-colors hover:bg-foreground/[0.03]"
          @click="navigateTo(getProfilePath(account.acct))"
        >
          <div class="flex items-center justify-between gap-3">
            <AccountCard
              :account="account"
              :profile-url="getProfilePath(account.acct)"
              show-bio
              class="min-w-0 flex-1"
            />
            <FollowButton
              v-if="!isCurrentUser(account.id) && hasRelationship(account.id)"
              :is-following="isFollowing(account.id)"
              :requested="getRelationship(account.id).requested"
              size="sm"
              @click.prevent.stop
              @follow="toggleFollow(account.id)"
              @unfollow="toggleFollow(account.id)"
            />
          </div>
          <div class="mt-2 flex items-center gap-4 pl-12 text-sm text-muted-foreground">
            <span><strong class="text-foreground">{{ account.followersCount?.toLocaleString() }}</strong> followers</span>
            <span><strong class="text-foreground">{{ account.followingCount?.toLocaleString() }}</strong> following</span>
          </div>
        </div>
      </div>

      <template #fallback>
        <div class="space-y-3 p-4">
          <div v-for="i in 5" :key="i" class="flex items-center gap-3">
            <Skeleton class="size-10 rounded-full" />
            <div class="flex-1 space-y-2">
              <Skeleton class="h-4 w-32" />
              <Skeleton class="h-3 w-48" />
            </div>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
