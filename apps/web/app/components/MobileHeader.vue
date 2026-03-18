<script setup lang="ts">
import { AppBar } from '@repo/ui';
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
  <header class="fixed top-0 left-0 right-0 z-[100]">
    <AppBar
      :title="navigation.pageTitle"
      :left-icon="canGoBack ? 'back' : 'menu'"
      :left-label="canGoBack ? 'Go back' : 'Open menu'"
      right-icon="explore"
      right-label="Explore"
      @left-click="handleLeftClick"
      @right-click="router.push('/explore')"
    />
  </header>
</template>
