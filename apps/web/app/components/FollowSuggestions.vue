<script setup lang="ts">
import { AccountDisplayName, AccountHandle, Button } from '@repo/ui';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { useData } from '~/composables/useData';
import { formatCount } from '~/utils/format';

import 'swiper/css';

const { getSuggestedAccounts, getProfileUrl } = useData();
const { toggleFollow, isFollowing } = useFollows();
const suggestions = computed(() => getSuggestedAccounts());
</script>

<template>
  <div class="follow-suggestions py-4 border-b border-gray-200 bg-gray-50/50">
    <div class="px-4 mb-3 flex items-center justify-between">
      <h3 class="font-semibold text-gray-900">
        Who to follow
      </h3>
      <NuxtLink to="/explore" class="text-sm text-blue-500 hover:text-blue-600 no-underline">
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
          class="block bg-white rounded-xl border border-gray-200 p-3 hover:border-gray-300 transition-colors no-underline h-full"
        >
          <div class="flex flex-col items-center text-center">
            <img
              :src="account.avatar"
              :alt="account.displayName"
              class="w-14 h-14 rounded-full mb-2"
            >
            <AccountDisplayName
              :name="account.displayName || account.username"
              :emojis="account.emojis"
              class="text-sm truncate w-full block"
            />
            <AccountHandle
              :acct="account.acct"
              :show-instance="false"
              class="text-xs truncate w-full block mb-2"
            />
            <div class="text-xs text-gray-400 mb-3">
              {{ formatCount(account.followersCount) }} followers
            </div>
            <Button
              size="sm"
              class="w-full h-8 text-xs" :class="[
                isFollowing(account.id)
                  ? 'bg-white text-gray-700 border border-gray-300 hover:border-red-300 hover:text-red-600 hover:bg-white'
                  : '',
              ]"
              @click.prevent.stop="toggleFollow(account.id)"
            >
              {{ isFollowing(account.id) ? 'Following' : 'Follow' }}
            </Button>
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
