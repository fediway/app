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
  <div class="hidden lg:sticky lg:top-0 lg:z-20 lg:block lg:bg-background">
    <!-- Header content -->
    <div class="relative flex h-14 items-center justify-center">
      <!-- Back button — absolute left, doesn't affect centering -->
      <button
        v-if="navigation.showBack"
        class="absolute left-2 flex size-8 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
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
        <!-- Icon — if set by page -->
        <div
          v-else-if="navigation.pageIcon && iconMap[navigation.pageIcon]"
          class="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted"
        >
          <component :is="iconMap[navigation.pageIcon]" :size="18" class="text-foreground/60" />
        </div>
        <!-- App icon only — on top-level pages (Home, Explore) -->
        <template v-else-if="['home', 'explore'].includes(navigation.activeItemId)">
          <img
            src="/images/app-icon-transparent.svg"
            alt="Fediway"
            class="size-10 shrink-0"
          >
        </template>

        <!-- Title + subtitle — on all other pages -->
        <div v-if="!['home', 'explore'].includes(navigation.activeItemId)" class="text-center" :class="{ 'text-left': navigation.pageImage || navigation.pageIcon }">
          <h1 class="text-base font-bold leading-tight">
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
      <div class="absolute top-0 left-0 z-20 h-4 w-4" style="background: radial-gradient(circle at 100% 100%, transparent 1rem, var(--background) 1rem)" />
      <div class="absolute top-0 right-0 z-20 h-4 w-4" style="background: radial-gradient(circle at 0% 100%, transparent 1rem, var(--background) 1rem)" />
      <div class="absolute top-0 left-0 right-0 z-20 h-4 rounded-t-2xl border border-b-0 border-border" />
    </div>
  </div>
</template>
