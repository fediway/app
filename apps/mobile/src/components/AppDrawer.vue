<script setup lang="ts">
import { Avatar } from '@repo/ui';
import { useRouter } from 'vue-router';
import { useNavigationStore } from '../stores/navigation';
import NavIcon from './NavIcon.vue';

const router = useRouter();
const navigation = useNavigationStore();

function handleItemClick(item: { id: string; to: string }) {
  navigation.closeDrawer();
  router.push(item.to);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-overlay">
      <div
        v-if="navigation.isDrawerOpen"
        class="fixed inset-0 z-50 bg-black/50"
        @click="navigation.closeDrawer()"
      >
        <Transition name="drawer-panel" appear>
          <aside
            class="absolute bottom-0 left-0 top-0 w-[280px] max-w-[80vw] overflow-y-auto bg-white dark:bg-gray-900"
            @click.stop
          >
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
            <nav class="flex flex-col p-2">
              <button
                v-for="item in navigation.drawerItems"
                :key="item.id"
                type="button"
                class="flex w-full items-center gap-4 rounded-lg border-none bg-transparent px-4 py-3.5 text-left transition-colors"
                :class="[
                  navigation.activeItemId === item.id
                    ? 'bg-gray-50 font-semibold text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                    : 'text-gray-700 dark:text-gray-300',
                ]"
                @click="handleItemClick(item)"
              >
                <NavIcon :name="item.icon" :size="22" />
                <span class="text-base">{{ item.label }}</span>
              </button>
            </nav>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-overlay-enter-active,
.drawer-overlay-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-overlay-enter-from,
.drawer-overlay-leave-to {
  opacity: 0;
}

.drawer-panel-enter-active,
.drawer-panel-leave-active {
  transition: transform 0.25s ease;
}
.drawer-panel-enter-from,
.drawer-panel-leave-to {
  transform: translateX(-100%);
}
</style>
