<script setup lang="ts">
import type { Component } from 'vue';

withDefaults(defineProps<{
  /** Optional icon component displayed above the title */
  icon?: Component;
  /** Main title text */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Optional action button label */
  actionLabel?: string;
}>(), {
  icon: undefined,
  description: undefined,
  actionLabel: undefined,
});

defineEmits<{
  action: [];
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center px-4 py-12 text-center">
    <div v-if="icon" class="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
      <component :is="icon" :size="32" class="text-gray-400" />
    </div>
    <p class="text-base font-medium text-gray-900 dark:text-gray-100">
      {{ title }}
    </p>
    <p v-if="description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      {{ description }}
    </p>
    <button
      v-if="actionLabel"
      type="button"
      class="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </button>
    <slot />
  </div>
</template>
