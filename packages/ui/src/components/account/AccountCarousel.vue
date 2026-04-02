<script setup lang="ts">
import type { Account } from '@repo/types';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { formatCount } from '../../utils/format';
import Avatar from '../ui/avatar/Avatar.vue';
import AccountDisplayName from './AccountDisplayName.vue';
import AccountHandle from './AccountHandle.vue';

import 'swiper/css';

defineProps<{
  accounts: Account[];
}>();

defineEmits<{
  accountClick: [acct: string];
}>();
</script>

<template>
  <div class="overflow-hidden">
    <Swiper
      :slides-per-view="2.3"
      :space-between="12"
      :free-mode="true"
      class="px-4"
    >
      <SwiperSlide
        v-for="account in accounts"
        :key="account.id"
        class="!h-auto"
      >
        <div
          class="block h-full cursor-pointer rounded-xl border border-border bg-card p-3 transition-colors hover:border-border"
          @click="$emit('accountClick', account.acct)"
        >
          <div class="flex flex-col items-center text-center">
            <Avatar :src="account.avatar" :alt="account.displayName" size="lg" class="mb-2" />
            <AccountDisplayName
              :name="account.displayName || account.username"
              :emojis="account.emojis"
              class="block w-full truncate text-sm"
            />
            <AccountHandle
              :acct="account.acct"
              :show-instance="false"
              class="block w-full truncate text-xs"
            />
            <div class="mb-3 mt-1 text-xs text-muted-foreground/60">
              {{ account.followersCount != null ? formatCount(account.followersCount) : 0 }} followers
            </div>
            <!-- Action slot for follow button -->
            <slot name="action" :account="account" />
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>
