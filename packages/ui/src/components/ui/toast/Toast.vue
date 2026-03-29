<script setup lang="ts">
import type { Toast } from './useToast';
import { computed, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{
  toast: Toast;
}>();

const emit = defineEmits<{
  dismiss: [id: string];
}>();

const visible = ref(false);
let dismissTimer: ReturnType<typeof setTimeout> | undefined;

const dotClass = computed(() => {
  switch (props.toast.variant) {
    case 'success': return 'bg-green';
    case 'error': return 'bg-red';
    default: return '';
  }
});

onMounted(() => {
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
  setTimeout(() => {
    emit('dismiss', props.toast.id);
  }, 200);
}
</script>

<template>
  <div
    role="status"
    aria-live="polite"
    class="pointer-events-auto inline-flex items-center gap-2.5 rounded-full bg-primary px-5 py-2.5 shadow-lg transition-all duration-200"
    :class="[
      visible
        ? 'translate-y-0 opacity-100'
        : 'translate-y-2 opacity-0',
    ]"
  >
    <span
      v-if="dotClass"
      class="size-2 shrink-0 rounded-full"
      :class="dotClass"
    />
    <div class="flex flex-col">
      <p class="text-sm font-medium text-primary-foreground">
        {{ toast.title }}
      </p>
      <p v-if="toast.description" class="text-sm text-primary-foreground/70">
        {{ toast.description }}
      </p>
    </div>
    <button
      v-if="toast.action"
      class="ml-1 text-sm font-medium text-primary-foreground/90 underline underline-offset-2 hover:text-primary-foreground cursor-pointer"
      @click.stop="toast.action.onClick(); dismiss()"
    >
      {{ toast.action.label }}
    </button>
  </div>
</template>
