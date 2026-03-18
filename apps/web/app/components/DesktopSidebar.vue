<script setup lang="ts">
import { PhPlus } from '@phosphor-icons/vue';
import { Button, NavIcon } from '@repo/ui';
import { usePostComposer } from '~/composables/usePostComposer';
import { useNavigationStore } from '~/stores/navigation';

const navigation = useNavigationStore();
const { open: openComposer } = usePostComposer();
</script>

<template>
  <div class="flex flex-col">
    <!-- User Profile Section -->
    <NuxtLink
      :to="`/@${navigation.currentUser.acct}`"
      class="flex items-center gap-3 py-4 px-4 mb-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors no-underline"
    >
      <img
        :src="navigation.currentUser.avatar"
        :alt="navigation.currentUser.name"
        class="w-10 h-10 rounded-full shrink-0"
      >
      <div class="min-w-0">
        <div class="text-sm font-semibold truncate text-gray-900 dark:text-white">
          {{ navigation.currentUser.name }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
          @{{ navigation.currentUser.acct }}
        </div>
      </div>
    </NuxtLink>

    <!-- New Post Button -->
    <div class="px-4 mb-4">
      <Button
        class="w-full py-3 text-[15px]"
        @click="openComposer()"
      >
        <PhPlus :size="20" />
        <span>New Post</span>
      </Button>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex flex-col">
      <NuxtLink
        v-for="item in navigation.menuItems"
        :key="item.id"
        :to="item.to"
        class="flex items-center gap-3 w-full py-3 px-4 bg-transparent border-none cursor-pointer text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors no-underline" :class="[
          navigation.activeItemId === item.id ? 'font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300',
        ]"
      >
        <NavIcon :name="item.icon" :size="22" />
        <span class="text-[15px]">{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>
