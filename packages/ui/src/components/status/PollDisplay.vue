<script setup lang="ts">
import type { Poll } from '@repo/types';
import { PhCheck } from '@phosphor-icons/vue';
import { computed } from 'vue';
import { formatRelativeDuration } from '../../utils/date';

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
  if (!props.poll.expiresAt)
    return '';
  if (props.poll.expired || new Date(props.poll.expiresAt).getTime() <= Date.now())
    return 'Closed';
  return formatRelativeDuration(props.poll.expiresAt);
});
</script>

<template>
  <div class="space-y-2">
    <!-- Options -->
    <div
      v-for="(option, index) in poll.options"
      :key="index"
      class="relative overflow-hidden rounded-lg border border-border"
    >
      <!-- Background bar -->
      <div
        class="absolute inset-0 transition-all"
        :class="[isVoted(index) ? 'bg-accent' : 'bg-muted/50']"
        :style="{ width: `${getPercentage(option.votesCount)}%` }"
      />

      <!-- Content -->
      <div class="relative flex items-center justify-between px-3 py-2">
        <div class="flex items-center gap-2">
          <PhCheck
            v-if="isVoted(index)"
            :size="16"
            class="shrink-0 text-primary"
            weight="bold"
          />
          <span class="text-sm text-foreground">{{ option.title }}</span>
        </div>
        <span class="text-sm font-medium text-muted-foreground">{{ getPercentage(option.votesCount) }}%</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <span>{{ totalVotes }} vote{{ totalVotes !== 1 ? 's' : '' }}</span>
      <span v-if="poll.multiple" class="text-muted-foreground">·</span>
      <span v-if="poll.multiple">Multiple choices</span>
      <span v-if="timeRemaining" class="text-muted-foreground">·</span>
      <span v-if="timeRemaining">{{ timeRemaining }}</span>
    </div>
  </div>
</template>
