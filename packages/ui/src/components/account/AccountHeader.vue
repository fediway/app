<script setup lang="ts">
import type { Account } from '@repo/types';
import Avatar from '../primitives/Avatar.vue';

interface Props {
  account: Account;
}

defineProps<Props>();
</script>

<template>
  <div class="relative mb-4">
    <!-- Header Banner Image -->
    <div class="w-full h-[120px] sm:h-[150px] overflow-hidden bg-gray-200">
      <img
        v-if="account.header"
        :src="account.header"
        alt="Profile header"
        class="w-full h-full object-cover"
      >
    </div>

    <!-- Profile Avatar (overlapping, positioned left) -->
    <div class="absolute left-4 bottom-0 translate-y-1/2">
      <div class="rounded-full border-4 border-white shadow-sm bg-white">
        <Avatar
          :src="account.avatar"
          :alt="`${account.displayName}'s avatar`"
          size="xl"
        />
      </div>
    </div>
  </div>
</template>
