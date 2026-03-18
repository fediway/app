<script setup lang="ts">
import type { Account } from '@repo/types';
import { PhArrowLeft } from '@phosphor-icons/vue';
import Avatar from '../primitives/Avatar.vue';

withDefaults(defineProps<{
  account: Account;
  followsYou?: boolean;
  showBack?: boolean;
}>(), {
  followsYou: false,
  showBack: true,
});

defineEmits<{ back: [] }>();
</script>

<template>
  <div class="relative mb-16">
    <!-- Header Banner Image -->
    <div class="w-full h-[157px] overflow-hidden bg-gray-200 dark:bg-gray-800">
      <img
        v-if="account.header"
        :src="account.header"
        alt="Profile header"
        class="w-full h-full object-cover"
        loading="lazy"
      >
    </div>

    <!-- Back Button -->
    <button
      v-if="showBack"
      class="absolute top-[50px] left-3 flex items-center justify-center w-[44px] h-[44px] rounded-full bg-[#F6F3EB] cursor-pointer hover:bg-[#ede9df] transition-colors"
      aria-label="Go back"
      @click="$emit('back')"
    >
      <PhArrowLeft :size="20" />
    </button>

    <!-- Profile Avatar -->
    <div class="absolute left-4 bottom-0 translate-y-1/2">
      <Avatar
        :src="account.avatar"
        :alt="`${account.displayName}'s avatar`"
        size="xl"
        class="!w-[100px] !h-[100px] border-4 border-white dark:border-gray-900"
      />
    </div>

    <!-- Badge slot (bottom-right, below header image) -->
    <slot name="badge" />
  </div>
</template>
