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
        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400',
    ]"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <PhWarning :size="16" />
    <span>CW</span>
  </button>
</template>
