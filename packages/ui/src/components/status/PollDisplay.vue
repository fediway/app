<script setup lang="ts">
import type { Poll } from '@repo/types';
import { PhCheck } from '@phosphor-icons/vue';
import { computed } from 'vue';

const props = defineProps<{
  poll: Poll;
}>();

defineEmits<{
  vote: [optionIndices: number[]];
}>();

const totalVotes = computed(() => props.poll.votesCount || 0);

function getPercentage(votesCount?: number): number {
  if (!votesCount || totalVotes.value === 0)
    return 0;
  return Math.round((votesCount / totalVotes.value) * 100);
}

function isVoted(index: number): boolean {
  return props.poll.ownVotes?.includes(index) ?? false;
}

const timeRemaining = computed(() => {
  if (props.poll.expired)
    return 'Closed';
  if (!props.poll.expiresAt)
    return '';
  const diff = new Date(props.poll.expiresAt).getTime() - Date.now();
  if (diff <= 0)
    return 'Closed';
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0)
    return `${days}d left`;
  if (hours > 0)
    return `${hours}h left`;
  return `${Math.floor(diff / 60000)}m left`;
});
</script>

<template>
  <div class="space-y-2">
    <!-- Options -->
    <div
      v-for="(option, index) in poll.options"
      :key="index"
      class="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <!-- Background bar -->
      <div
        class="absolute inset-0 transition-all"
        :class="[isVoted(index) ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-50 dark:bg-gray-800/50']"
        :style="{ width: `${getPercentage(option.votesCount)}%` }"
      />

      <!-- Content -->
      <div class="relative flex items-center justify-between px-3 py-2">
        <div class="flex items-center gap-2">
          <PhCheck
            v-if="isVoted(index)"
            :size="16"
            class="shrink-0 text-blue-500"
            weight="bold"
          />
          <span class="text-sm text-gray-900 dark:text-gray-100">{{ option.title }}</span>
        </div>
        <span class="text-sm font-medium text-gray-500">{{ getPercentage(option.votesCount) }}%</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center gap-2 text-sm text-gray-500">
      <span>{{ totalVotes }} vote{{ totalVotes !== 1 ? 's' : '' }}</span>
      <span v-if="poll.multiple" class="text-gray-400">·</span>
      <span v-if="poll.multiple">Multiple choices</span>
      <span v-if="timeRemaining" class="text-gray-400">·</span>
      <span v-if="timeRemaining">{{ timeRemaining }}</span>
    </div>
  </div>
</template>
