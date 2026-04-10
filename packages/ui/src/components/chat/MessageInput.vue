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
      autocomplete="off"
      autocapitalize="sentences"
      autocorrect="on"
      enterkeyhint="send"
      class="flex-1 rounded-full bg-muted px-4 py-2 text-base outline-hidden transition-colors focus:bg-card focus:ring-2 focus:ring-ring"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <button
      type="submit"
      :disabled="!modelValue.trim() || disabled"
      class="flex size-10 items-center justify-center rounded-full transition-colors"
      :class="[
        modelValue.trim()
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'cursor-not-allowed bg-muted text-muted-foreground/60',
      ]"
    >
      <PhPaperPlaneRight :size="20" />
    </button>
  </form>
</template>
