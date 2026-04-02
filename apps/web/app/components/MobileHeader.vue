<script setup lang="ts">
import type { FeedType } from '~/composables/useFeedType';
import { PhBell, PhCaretDown, PhList } from '@phosphor-icons/vue';
import { AppBar, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui';
import { useFeedType } from '~/composables/useFeedType';
import { useScrollDirection } from '~/composables/useScrollDirection';

import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();
const { hidden } = useScrollDirection();
const { feedType, set: setFeedType } = useFeedType();

const isHome = computed(() => navigation.activeItemId === 'home' && !navigation.showBack);

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
    class="sticky top-0 left-0 right-0 z-[100] transition-transform duration-300 ease-out"
    :class="hidden ? '-translate-y-full' : 'translate-y-0'"
  >
    <AppBar
      :title="!isHome && !navigation.pageSubtitle ? navigation.pageTitle : undefined"
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
      <template v-else-if="navigation.pageSubtitle" #title>
        <div class="min-w-0 text-center">
          <div class="truncate text-sm font-semibold leading-tight text-foreground">
            {{ navigation.pageTitle }}
          </div>
          <div class="truncate text-xs leading-tight text-muted-foreground">
            {{ navigation.pageSubtitle }}
          </div>
        </div>
      </template>

      <template #trailing>
        <!-- Own profile: burger menu on the right -->
        <Button
          v-if="navigation.isProfilePage"
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          @click="navigation.openSidebar()"
        >
          <PhList :size="24" />
        </Button>

        <!-- All other pages: notification bell -->
        <Button
          v-else
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
