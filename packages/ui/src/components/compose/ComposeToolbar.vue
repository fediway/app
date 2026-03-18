<script setup lang="ts">
import { PhChartBar, PhImage } from '@phosphor-icons/vue';
import ContentWarningToggle from './ContentWarningToggle.vue';

defineProps<{
  showContentWarning: boolean;
  showPoll: boolean;
}>();

defineEmits<{
  'update:showContentWarning': [value: boolean];
  'togglePoll': [];
  'addMedia': [];
}>();
</script>

<template>
  <div class="flex items-center gap-3">
    <ContentWarningToggle
      :model-value="showContentWarning"
      @update:model-value="$emit('update:showContentWarning', $event)"
    />

    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors"
      :class="[
        showPoll
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400',
      ]"
      @click="$emit('togglePoll')"
    >
      <PhChartBar :size="16" />
      <span>Poll</span>
    </button>

    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-400"
      @click="$emit('addMedia')"
    >
      <PhImage :size="16" />
      <span>Media</span>
    </button>
  </div>
</template>
