<script setup lang="ts">
import { AppBar, Avatar } from '@repo/ui';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNavigationStore } from '../stores/navigation';

const props = withDefaults(defineProps<{
  showBack?: boolean;
}>(), {
  showBack: false,
});

const router = useRouter();
const navigation = useNavigationStore();

const showBackButton = computed(() => {
  return props.showBack || !navigation.activeTab;
});

function handleLeftClick() {
  if (showBackButton.value) {
    router.back();
  }
  else {
    navigation.openDrawer();
  }
}
</script>

<template>
  <header class="safe-area-top fixed inset-x-0 top-0 z-40">
    <AppBar
      :title="navigation.pageTitleAvatar ? undefined : navigation.pageTitle"
      :left-icon="showBackButton ? 'back' : 'menu'"
      :left-label="showBackButton ? 'Go back' : 'Open menu'"
      right-icon="explore"
      right-label="Explore"
      @left-click="handleLeftClick"
      @right-click="router.push('/explore')"
    >
      <template v-if="navigation.pageTitleAvatar" #title>
        <div class="flex items-center justify-center gap-2">
          <Avatar :src="navigation.pageTitleAvatar" :alt="navigation.pageTitle" size="xs" />
          <span class="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ navigation.pageTitle }}
          </span>
        </div>
      </template>
    </AppBar>
  </header>
</template>
