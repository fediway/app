<script setup lang="ts">
import { Avatar, NavIcon } from '@repo/ui';
import {
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  VisuallyHidden,
} from 'reka-ui';
import { onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useBackButton } from '../composables/useBackButton';
import { useNavigationStore } from '../stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();
const { register: registerBackButton } = useBackButton();

let unregisterBack: (() => void) | null = null;

function onOpenChange(open: boolean) {
  if (open) {
    unregisterBack = registerBackButton(90, () => {
      navigation.closeDrawer();
      return true;
    });
  }
  else {
    navigation.closeDrawer();
    unregisterBack?.();
    unregisterBack = null;
  }
}

onBeforeUnmount(() => {
  unregisterBack?.();
  unregisterBack = null;
});

function handleItemClick(item: { id: string; to: string }) {
  navigation.closeDrawer();
  router.push(item.to);
}
</script>

<template>
  <DialogRoot :open="navigation.isDrawerOpen" @update:open="onOpenChange">
    <DialogPortal>
      <Transition
        enter-active-class="motion-safe:transition-opacity motion-safe:duration-200 motion-safe:ease-out"
        enter-from-class="opacity-0"
        leave-active-class="motion-safe:transition-opacity motion-safe:duration-200 motion-safe:ease-in"
        leave-to-class="opacity-0"
      >
        <DialogOverlay v-if="navigation.isDrawerOpen" class="fixed inset-0 z-50 bg-black/50" />
      </Transition>

      <Transition
        enter-active-class="motion-safe:transition-transform motion-safe:duration-250 motion-safe:ease-out"
        enter-from-class="-translate-x-full"
        leave-active-class="motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-in"
        leave-to-class="-translate-x-full"
      >
        <DialogContent
          v-if="navigation.isDrawerOpen"
          class="fixed bottom-0 left-0 top-0 z-50 w-[280px] max-w-[80vw] overflow-y-auto bg-white dark:bg-gray-900"
          @escape-key-down="navigation.closeDrawer()"
        >
          <VisuallyHidden>
            <DialogTitle>Main menu</DialogTitle>
          </VisuallyHidden>

          <!-- User section -->
          <div class="flex flex-col items-center border-b border-gray-100 px-4 pb-6 pt-8 safe-area-top dark:border-gray-800">
            <Avatar
              :src="navigation.currentUser.avatar"
              :alt="navigation.currentUser.name"
              size="lg"
              class="mb-3"
            />
            <div class="text-base font-semibold text-gray-900 dark:text-gray-100">
              {{ navigation.currentUser.name }}
            </div>
            <div class="text-sm text-gray-500">
              @{{ navigation.currentUser.username }}
            </div>
          </div>

          <!-- Menu items -->
          <nav aria-label="Main menu" class="flex flex-col p-2">
            <button
              v-for="item in navigation.drawerItems"
              :key="item.id"
              type="button"
              class="flex w-full items-center gap-4 rounded-lg border-none bg-transparent px-4 py-3.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              :class="[
                navigation.activeItemId === item.id
                  ? 'bg-gray-50 font-semibold text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                  : 'text-gray-700 dark:text-gray-300',
              ]"
              :aria-current="navigation.activeItemId === item.id ? 'page' : undefined"
              @click="handleItemClick(item)"
            >
              <NavIcon :name="item.icon" :size="22" />
              <span class="text-base">{{ item.label }}</span>
            </button>
          </nav>
        </DialogContent>
      </Transition>
    </DialogPortal>
  </DialogRoot>
</template>
