<script setup lang="ts">
import { PhBell } from '@phosphor-icons/vue';
import { AppBar, Button } from '@repo/ui';
import { useScrollDirection } from '~/composables/useScrollDirection';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();
const { hidden } = useScrollDirection();

// Back button uses the same source of truth as desktop: navigation.showBack.
// Behavior: go back in history if possible, otherwise navigate to parent route.
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
      :title="!navigation.pageImage ? navigation.pageTitle : undefined"
      :left-icon="navigation.showBack ? 'back' : undefined"
      :left-label="navigation.showBack ? 'Go back' : 'Open menu'"
      :bordered="false"
      @left-click="navigation.showBack ? handleBack() : navigation.openSidebar()"
    >
      <!-- Leading: user avatar on top-level pages -->
      <template v-if="!navigation.showBack" #leading>
        <button
          type="button"
          class="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center"
          aria-label="Open menu"
          @click="navigation.openSidebar()"
        >
          <img
            v-if="navigation.currentUser?.avatar"
            :src="navigation.currentUser.avatar"
            :alt="navigation.currentUser.name"
            class="size-8 rounded-full object-cover"
          >
          <span v-else class="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
            ?
          </span>
        </button>
      </template>

      <!-- Rich title with image (for conversations, profiles) -->
      <template v-if="navigation.pageImage" #title>
        <div class="flex min-w-0 items-center justify-center gap-2.5">
          <img :src="navigation.pageImage" :alt="navigation.pageTitle" class="size-9 shrink-0 rounded-full object-cover">
          <div class="min-w-0 text-left">
            <div class="truncate text-sm font-semibold leading-tight text-foreground">
              {{ navigation.pageTitle }}
            </div>
            <div v-if="navigation.pageSubtitle" class="truncate text-xs leading-tight text-muted-foreground">
              {{ navigation.pageSubtitle }}
            </div>
          </div>
        </div>
      </template>

      <template #trailing>
        <Button
          variant="muted"
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
