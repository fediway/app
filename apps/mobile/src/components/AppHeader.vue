<script setup lang="ts">
import { AppBar, Avatar, renderCustomEmojis } from '@repo/ui';
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

const titleHtml = computed(() =>
  renderCustomEmojis(navigation.pageTitle, navigation.pageTitleEmojis ?? [], 'inline-block h-4 w-4 align-text-bottom'),
);

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
          <span class="truncate text-lg font-semibold text-gray-900 dark:text-gray-100" v-html="titleHtml" />
        </div>
      </template>
      <template v-else #title>
        <h1 class="m-0 truncate text-lg font-semibold text-foreground" v-html="titleHtml" />
      </template>
    </AppBar>
  </header>
</template>
