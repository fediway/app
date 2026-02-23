<script setup lang="ts">
import { RichText } from '@repo/ui';
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
          <NuxtLink :to="getProfileUrl(account.acct)" class="flex-shrink-0">
            <img
              :src="account.avatar"
              :alt="account.displayName"
              class="w-12 h-12 rounded-full"
            >
          </NuxtLink>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-3">
              <NuxtLink :to="getProfileUrl(account.acct)" class="min-w-0 no-underline">
                <div class="font-semibold text-gray-900 truncate">
                  {{ account.displayName }}
                </div>
                <div class="text-sm text-gray-500 truncate">
                  @{{ account.acct }}
                </div>
              </NuxtLink>
              <button
                type="button"
                class="flex-shrink-0 px-4 py-1.5 text-sm font-medium rounded-full transition-colors" :class="[
                  isFollowing(account.id)
                    ? 'text-gray-700 bg-white border border-gray-300 hover:border-red-300 hover:text-red-600'
                    : 'text-white bg-gray-900 hover:bg-gray-700',
                ]"
                @click="handleFollow(account.id)"
              >
                {{ isFollowing(account.id) ? 'Following' : 'Follow' }}
              </button>
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
