<script setup lang="ts">
import { PhWarning } from '@phosphor-icons/vue';

defineProps<{
  modelValue: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
}>();
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors"
    :class="[
      modelValue
        ? 'bg-primary text-primary-foreground'
        : 'bg-muted text-foreground hover:bg-accent',
    ]"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <PhWarning :size="16" />
    <span>CW</span>
  </button>
</template>
