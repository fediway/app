<script setup lang="ts">
import { AccountDisplayName, AccountHandle, Avatar, FollowButton } from '@repo/ui';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { useData } from '~/composables/useData';
import { formatCount } from '~/utils/format';

import 'swiper/css';

const { getSuggestedAccounts, getProfileUrl } = useData();
const { toggleFollow, isFollowing } = useFollows();
const suggestions = computed(() => getSuggestedAccounts());
</script>

<template>
  <div class="follow-suggestions border-b border-gray-200 bg-gray-50/50 py-4 dark:border-gray-800 dark:bg-gray-800/20">
    <div class="mb-3 flex items-center justify-between px-4">
      <h3 class="font-semibold text-gray-900 dark:text-white">
        Who to follow
      </h3>
      <NuxtLink to="/explore" class="text-sm text-blue-500 no-underline hover:text-blue-600">
        See all
      </NuxtLink>
    </div>

    <Swiper
      :slides-per-view="2.3"
      :space-between="12"
      :free-mode="true"
      class="px-4"
    >
      <SwiperSlide
        v-for="account in suggestions"
        :key="account.id"
      >
        <NuxtLink
          :to="getProfileUrl(account.acct)"
          class="block h-full rounded-xl border border-gray-200 bg-white p-3 no-underline transition-colors hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
        >
          <div class="flex flex-col items-center text-center">
            <Avatar
              :src="account.avatar"
              :alt="account.displayName"
              size="lg"
              class="mb-2"
            />
            <AccountDisplayName
              :name="account.displayName || account.username"
              :emojis="account.emojis"
              class="block w-full truncate text-sm"
            />
            <AccountHandle
              :acct="account.acct"
              :show-instance="false"
              class="mb-2 block w-full truncate text-xs"
            />
            <div class="mb-3 text-xs text-gray-400">
              {{ formatCount(account.followersCount) }} followers
            </div>
            <FollowButton
              :is-following="isFollowing(account.id)"
              size="sm"
              class="w-full"
              @follow.prevent.stop="toggleFollow(account.id)"
              @unfollow.prevent.stop="toggleFollow(account.id)"
            />
          </div>
        </NuxtLink>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<style scoped>
.follow-suggestions {
  overflow: hidden;
}

.follow-suggestions :deep(.swiper-slide) {
  height: auto;
}
</style>
