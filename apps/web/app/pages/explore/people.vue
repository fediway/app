<script setup lang="ts">
import { AccountDisplayName, AccountHandle, Avatar, Button, RichText } from '@repo/ui';
import { computed } from 'vue';
import { useData } from '~/composables/useData';
import { useFollows } from '~/composables/useFollows';

const { getAllAccounts, getProfileUrl } = useData();
const { toggleFollow, isFollowing } = useFollows();

const suggestedAccounts = computed(() => getAllAccounts());

function handleFollow(accountId: string) {
  toggleFollow(accountId);
}
</script>

<template>
  <div class="w-full">
    <ExploreHeader title="Explore" />

    <div class="divide-y divide-gray-100">
      <div
        v-for="account in suggestedAccounts"
        :key="account.id"
        class="px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-start gap-3">
          <NuxtLink :to="getProfileUrl(account.acct)" class="shrink-0">
            <Avatar :src="account.avatar" :alt="account.displayName" size="lg" />
          </NuxtLink>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-3">
              <NuxtLink :to="getProfileUrl(account.acct)" class="min-w-0 no-underline">
                <AccountDisplayName
                  :name="account.displayName || account.username"
                  :emojis="account.emojis"
                  class="truncate block"
                />
                <AccountHandle :acct="account.acct" class="text-sm truncate block" />
              </NuxtLink>
              <Button
                size="sm"
                class="shrink-0" :class="[
                  isFollowing(account.id)
                    ? 'bg-white text-gray-700 border border-gray-300 hover:border-red-300 hover:text-red-600 hover:bg-white'
                    : '',
                ]"
                @click="handleFollow(account.id)"
              >
                {{ isFollowing(account.id) ? 'Following' : 'Follow' }}
              </Button>
            </div>
            <RichText v-if="account.note" :content="account.note" :emojis="account.emojis" class="text-sm text-gray-600 mt-1 line-clamp-2" />
            <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span><strong class="text-gray-900">{{ account.followersCount?.toLocaleString() }}</strong> followers</span>
              <span><strong class="text-gray-900">{{ account.followingCount?.toLocaleString() }}</strong> following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
