<script setup lang="ts">
import { PhBell } from '@phosphor-icons/vue';
import { AppBar, Button } from '@repo/ui';
import { useTabNavigation } from '~/composables/useTabNavigation';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();
const { canGoBack } = useTabNavigation();

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
  <header class="sticky top-0 left-0 right-0 z-[100]">
    <AppBar
      :title="navigation.pageTitle"
      :left-icon="canGoBack ? 'back' : 'menu'"
      :left-label="canGoBack ? 'Go back' : 'Open menu'"
      @left-click="handleLeftClick"
    >
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
