<script setup lang="ts">
import ToastItem from './Toast.vue';
import { useToast } from './useToast';

const { toasts, removeToast } = useToast();
</script>

<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed bottom-0 right-0 z-[200] flex max-h-screen flex-col-reverse gap-2 p-4 sm:bottom-4 sm:right-4 sm:max-w-sm"
    >
      <TransitionGroup name="toast">
        <ToastItem
          v-for="toast in toasts"
          :key="toast.id"
          :toast="toast"
          @dismiss="removeToast"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-move {
  transition: transform 0.3s ease;
}
</style>
