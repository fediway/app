<script setup lang="ts">
import type { Component } from 'vue';
import { PhArrowLeft, PhHash, PhLink } from '@phosphor-icons/vue';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();

const iconMap: Record<string, Component> = {
  PhHash,
  PhLink,
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
  <div class="hidden lg:sticky lg:top-0 lg:z-20 lg:block lg:bg-gray-50 dark:lg:bg-gray-950">
    <!-- Header content -->
    <div class="relative flex items-center justify-center py-3">
      <!-- Back button — absolute left, doesn't affect centering -->
      <button
        v-if="navigation.showBack"
        class="absolute left-2 flex size-8 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
        @click="goBack"
      >
        <PhArrowLeft :size="18" weight="bold" />
      </button>

      <!-- Center group: optional image/icon + title/subtitle -->
      <div class="flex items-center gap-2.5">
        <!-- Image (avatar, favicon) -->
        <img
          v-if="navigation.pageImage"
          :src="navigation.pageImage"
          alt=""
          class="size-9 shrink-0 rounded-full object-cover"
        >
        <!-- Icon — only if no image -->
        <div
          v-else-if="navigation.pageIcon && iconMap[navigation.pageIcon]"
          class="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted"
        >
          <component :is="iconMap[navigation.pageIcon]" :size="18" class="text-foreground/60" />
        </div>

        <!-- Title + subtitle -->
        <div class="text-center" :class="{ 'text-left': navigation.pageImage || navigation.pageIcon }">
          <h1 class="text-[15px] font-bold leading-tight">
            {{ navigation.pageTitle }}
          </h1>
          <p v-if="navigation.pageSubtitle" class="text-xs leading-tight text-foreground/50">
            {{ navigation.pageSubtitle }}
          </p>
        </div>
      </div>
    </div>

    <!-- Rounded corner decoration — hangs below header, overlaps feed content -->
    <div class="relative h-0 pointer-events-none">
      <div class="corner-mask-left absolute top-0 left-0 z-20 h-4 w-4" />
      <div class="corner-mask-right absolute top-0 right-0 z-20 h-4 w-4" />
      <div class="absolute top-0 left-0 right-0 z-20 h-4 rounded-t-2xl border border-b-0 border-border" />
    </div>
  </div>
</template>

<style scoped>
.corner-mask-left,
.corner-mask-right {
  --corner-bg: rgb(249 250 251);
}

.dark .corner-mask-left,
.dark .corner-mask-right {
  --corner-bg: rgb(3 7 18);
}

.corner-mask-left {
  background: radial-gradient(circle at 100% 100%, transparent 1rem, var(--corner-bg) 1rem);
}

.corner-mask-right {
  background: radial-gradient(circle at 0% 100%, transparent 1rem, var(--corner-bg) 1rem);
}
</style>
