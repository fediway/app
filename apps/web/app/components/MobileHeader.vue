<script setup lang="ts">
import type { FeedType } from '~/composables/useFeedType';
import { PhArrowLeft, PhBell, PhCaretDown, PhList } from '@phosphor-icons/vue';
import { AppBar, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, renderCustomEmojis } from '@repo/ui';
import { useFeedType } from '~/composables/useFeedType';
import { useScrollDirection } from '~/composables/useScrollDirection';

import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();
const { hidden } = useScrollDirection();
const { feedType, set: setFeedType } = useFeedType();

const isHome = computed(() => navigation.activeItemId === 'home' && !navigation.showBack);

const titleHtml = computed(() =>
  renderCustomEmojis(navigation.pageTitle, navigation.pageTitleEmojis ?? [], 'inline-block h-4 w-4 align-text-bottom'),
);

const feedLabels: Record<FeedType, string> = {
  home: 'Home',
  explore: 'Explore',
  trending: 'Trending',
};

const feedLabel = computed(() => feedLabels[feedType.value]);

const feedOptions: { type: FeedType; label: string }[] = [
  { type: 'home', label: 'Home' },
  { type: 'trending', label: 'Trending' },
];

function handleBack() {
  if (window.history.length > 1) {
    router.back();
  }
  else {
    router.push('/');
  }
}
</script>

<template>
  <header
    class="sticky top-0 left-0 right-0 z-[100] pt-[env(safe-area-inset-top)] transition-transform duration-300 ease-out"
    :class="hidden ? '-translate-y-full' : 'translate-y-0'"
  >
    <!-- Profile pages: transparent header overlaying banner -->
    <div v-if="navigation.isAnyProfilePage" class="flex h-14 -mb-14 items-center justify-between px-4">
      <!-- Other profile: back button on the left -->
      <button
        v-if="!navigation.isProfilePage"
        type="button"
        class="flex size-11 items-center justify-center rounded-full bg-card/80 backdrop-blur-lg shadow-[0_2px_8px_rgba(0,0,0,0.15)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] cursor-pointer text-foreground"
        aria-label="Go back"
        @click="handleBack"
      >
        <PhArrowLeft :size="20" weight="bold" />
      </button>
      <div v-else />

      <!-- Own profile: burger on the right -->
      <button
        v-if="navigation.isProfilePage"
        type="button"
        class="flex size-11 items-center justify-center rounded-full bg-card/80 backdrop-blur-lg shadow-[0_2px_8px_rgba(0,0,0,0.15)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] cursor-pointer text-foreground"
        aria-label="Open menu"
        @click="navigation.openSidebar()"
      >
        <PhList :size="22" />
      </button>
    </div>

    <!-- All other pages: standard AppBar -->
    <AppBar
      v-else
      :left-icon="navigation.showBack ? 'back' : undefined"
      :left-label="navigation.showBack ? 'Go back' : undefined"
      :bordered="false"
      @left-click="navigation.showBack ? handleBack() : undefined"
    >
      <!-- Home: feed selector dropdown on the left -->
      <template v-if="isHome" #leading>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              type="button"
              class="inline-flex items-center gap-1 cursor-pointer text-base font-semibold text-foreground"
            >
              {{ feedLabel }}
              <PhCaretDown :size="14" weight="bold" class="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" :side-offset="8">
            <DropdownMenuItem
              v-for="option in feedOptions"
              :key="option.type"
              :class="{ 'font-semibold': feedType === option.type }"
              @select="setFeedType(option.type)"
            >
              {{ option.label }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </template>

      <!-- Rich title with subtitle (for conversations, profiles) -->
      <template v-if="!isHome && navigation.pageSubtitle" #title>
        <div class="min-w-0 text-center">
          <div class="truncate text-sm font-semibold leading-tight text-foreground" v-html="titleHtml" />
          <div class="truncate text-xs leading-tight text-muted-foreground">
            {{ navigation.pageSubtitle }}
          </div>
        </div>
      </template>

      <!-- Simple title (no subtitle) — still render with emoji support -->
      <template v-else-if="!isHome" #title>
        <h1 class="m-0 truncate text-lg font-semibold text-foreground" v-html="titleHtml" />
      </template>

      <template #trailing>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          @click="router.push('/notifications')"
        >
          <span class="relative">
            <PhBell :size="24" />
            <span
              v-if="navigation.hasUnreadNotifications"
              class="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-galaxy-500"
            />
          </span>
        </Button>
      </template>
    </AppBar>
  </header>
</template>
