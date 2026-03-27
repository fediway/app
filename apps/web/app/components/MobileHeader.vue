<script setup lang="ts">
import { PhBell } from '@phosphor-icons/vue';
import { AppBar, Button } from '@repo/ui';
import { useScrollDirection } from '~/composables/useScrollDirection';
import { useTabNavigation } from '~/composables/useTabNavigation';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();
const { canGoBack } = useTabNavigation();
const { hidden } = useScrollDirection();

function handleLeftClick() {
  if (canGoBack.value) {
    router.back();
  }
  else {
    navigation.openSidebar();
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
      :left-icon="canGoBack ? 'back' : undefined"
      :left-label="canGoBack ? 'Go back' : 'Open menu'"
      :bordered="false"
      @left-click="handleLeftClick"
    >
      <!-- Leading: user avatar (top-level) or back arrow (sub-page) -->
      <template v-if="!canGoBack" #leading>
        <button
          type="button"
          class="cursor-pointer"
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

      <!-- Rich title with avatar (for conversation, profile, etc.) -->
      <template v-if="navigation.pageImage" #title>
        <div class="flex min-w-0 items-center justify-center gap-2.5">
          <img :src="navigation.pageImage" :alt="navigation.pageTitle" class="size-9 shrink-0 rounded-full object-cover">
          <div class="min-w-0 text-left">
            <div class="truncate text-sm font-semibold text-foreground leading-tight">
              {{ navigation.pageTitle }}
            </div>
            <div v-if="navigation.pageSubtitle" class="truncate text-xs text-muted-foreground leading-tight">
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
