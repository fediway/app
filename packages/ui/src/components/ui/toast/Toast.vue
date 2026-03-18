<script setup lang="ts">
import type { Toast } from './useToast';
import { PhCheck, PhInfo, PhWarningCircle, PhX } from '@phosphor-icons/vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{
  toast: Toast;
}>();

const emit = defineEmits<{
  dismiss: [id: string];
}>();

const visible = ref(false);
let dismissTimer: ReturnType<typeof setTimeout> | undefined;

const icon = computed(() => {
  switch (props.toast.variant) {
    case 'success': return PhCheck;
    case 'error': return PhWarningCircle;
    default: return PhInfo;
  }
});

const iconClass = computed(() => {
  switch (props.toast.variant) {
    case 'success': return 'text-green-600 dark:text-green-400';
    case 'error': return 'text-red-600 dark:text-red-400';
    default: return 'text-foreground/60';
  }
});

onMounted(() => {
  // Trigger enter animation on next frame
  requestAnimationFrame(() => {
    visible.value = true;
  });

  dismissTimer = setTimeout(() => {
    dismiss();
  }, props.toast.duration);
});

onUnmounted(() => {
  if (dismissTimer)
    clearTimeout(dismissTimer);
});

function dismiss() {
  visible.value = false;
  // Wait for exit animation
  setTimeout(() => {
    emit('dismiss', props.toast.id);
  }, 200);
}
</script>

<template>
  <div
    role="status"
    aria-live="polite"
    class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-lg transition-all duration-200"
    :class="[
      visible
        ? 'translate-y-0 opacity-100'
        : 'translate-y-2 opacity-0',
    ]"
  >
    <component
      :is="icon"
      :size="20"
      :class="iconClass"
      class="mt-0.5 shrink-0"
      weight="fill"
    />

    <div class="min-w-0 flex-1">
      <p class="text-sm font-medium text-foreground">
        {{ toast.title }}
      </p>
      <p v-if="toast.description" class="mt-1 text-sm text-foreground/60">
        {{ toast.description }}
      </p>
    </div>

    <button
      type="button"
      class="shrink-0 rounded-full p-1 text-foreground/40 transition-colors hover:bg-muted hover:text-foreground"
      @click="dismiss"
    >
      <PhX :size="16" />
    </button>
  </div>
</template>
