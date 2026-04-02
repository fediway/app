<script setup lang="ts">
import type { Component } from 'vue';
import { PhArrowLeft, PhBell, PhBookmarkSimple, PhChatCircle, PhHash, PhHeart, PhLink } from '@phosphor-icons/vue';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();

const iconMap: Record<string, Component> = {
  PhHash,
  PhLink,
  PhHeart,
  PhBookmarkSimple,
  PhBell,
  PhChatCircle,
};

const iconColorMap: Record<string, string> = {
  PhHash: 'text-galaxy-500 dark:text-galaxy-400',
  PhLink: 'text-galaxy-500 dark:text-galaxy-400',
  PhHeart: 'text-rose-500',
  PhBookmarkSimple: 'text-yellow',
  PhBell: 'text-foreground',
  PhChatCircle: 'text-galaxy-500 dark:text-galaxy-400',
};

function goBack() {
  if (window.history.length > 1) {
    router.back();
  }
  else {
    router.push('/');
  }
}
</script>

<template>
  <!-- Sticky at browser top, page bg masks content under rounded corners -->
  <div class="hidden lg:sticky lg:top-0 lg:z-20 lg:block lg:bg-background">
    <!-- Header content -->
    <div class="relative flex h-14 items-center justify-center">
      <!-- Back button — absolute left, doesn't affect centering -->
      <button
        v-if="navigation.showBack"
        class="absolute left-2 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
        @click="goBack"
      >
        <PhArrowLeft :size="18" weight="bold" />
      </button>

      <!-- Center group: optional image/icon + title/subtitle -->
      <div class="flex items-center gap-2.5">
        <!-- Icon — if set by page -->
        <div
          v-if="navigation.pageIcon && iconMap[navigation.pageIcon]"
          class="flex shrink-0 items-center justify-center"
        >
          <component :is="iconMap[navigation.pageIcon]" :size="30" weight="bold" :class="iconColorMap[navigation.pageIcon] || 'text-galaxy-500 dark:text-galaxy-400'" />
        </div>

        <!-- Title + subtitle — show when page sets a header override, or on non-tab pages -->
        <div class="text-center" :class="{ 'text-left': navigation.pageIcon }">
          <h1 class="text-base font-bold leading-tight">
            {{ navigation.pageTitle }}
          </h1>
          <p v-if="navigation.pageSubtitle" class="text-xs leading-tight text-muted-foreground-subtle">
            {{ navigation.pageSubtitle }}
          </p>
        </div>
      </div>
    </div>

    <!-- Rounded corner decoration — hangs below header, overlaps feed content -->
    <div class="relative h-0 pointer-events-none">
      <div class="absolute top-0 left-0 z-20 h-4 w-4" style="background: radial-gradient(circle at 100% 100%, transparent 1rem, var(--background) 1rem)" />
      <div class="absolute top-0 right-0 z-20 h-4 w-4" style="background: radial-gradient(circle at 0% 100%, transparent 1rem, var(--background) 1rem)" />
      <div class="absolute top-0 left-0 right-0 z-20 h-4 rounded-t-2xl border border-b-0 border-border" />
    </div>
  </div>
</template>
