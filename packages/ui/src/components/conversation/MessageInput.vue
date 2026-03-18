<script setup lang="ts">
import { PhPaperPlaneRight } from '@phosphor-icons/vue';

defineProps<{
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: string];
  'send': [];
}>();
</script>

<template>
  <form class="flex items-center gap-2" @submit.prevent="$emit('send')">
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder ?? 'Write a message...'"
      :disabled="disabled"
      class="flex-1 rounded-full bg-gray-100 px-4 py-2 text-[15px] outline-hidden transition-colors focus:bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:focus:bg-gray-700"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <button
      type="submit"
      :disabled="!modelValue.trim() || disabled"
      class="flex size-10 items-center justify-center rounded-full transition-colors"
      :class="[
        modelValue.trim()
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800',
      ]"
    >
      <PhPaperPlaneRight :size="20" />
    </button>
  </form>
</template>
