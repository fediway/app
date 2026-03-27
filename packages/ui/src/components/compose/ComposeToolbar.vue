<script setup lang="ts">
import { PhChartBar, PhImage } from '@phosphor-icons/vue';
import ContentWarningToggle from './ContentWarningToggle.vue';

interface Props {
  showContentWarning: boolean;
  showPoll: boolean;
  /** Disable poll button (when media is attached) */
  disablePoll?: boolean;
  /** Disable media button (when poll is active or at max) */
  disableMedia?: boolean;
}

withDefaults(defineProps<Props>(), {
  disablePoll: false,
  disableMedia: false,
});

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
          ? 'bg-primary text-primary-foreground'
          : disablePoll
            ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
            : 'bg-muted text-foreground hover:bg-accent',
      ]"
      :disabled="disablePoll && !showPoll"
      @click="$emit('togglePoll')"
    >
      <PhChartBar :size="16" />
      <span>Poll</span>
    </button>

    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors"
      :class="[
        disableMedia
          ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
          : 'bg-muted text-foreground hover:bg-accent',
      ]"
      :disabled="disableMedia"
      @click="$emit('addMedia')"
    >
      <PhImage :size="16" />
      <span>Media</span>
    </button>
  </div>
</template>
