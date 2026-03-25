<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  /** ISO 8601 datetime string */
  datetime: string;
  /** Whether to show full date on hover */
  showTooltip?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showTooltip: true,
});

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime()))
    return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60)
    return 'now';
  if (diffMin < 60)
    return `${diffMin}m`;
  if (diffHour < 24)
    return `${diffHour}h`;
  if (diffDay < 7)
    return `${diffDay}d`;
  if (diffWeek < 52)
    return `${diffWeek}w`;

  // Show full date for older posts
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime()))
    return '';
  return date.toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const relativeTime = computed(() => formatRelativeTime(props.datetime));
const fullDate = computed(() => formatFullDate(props.datetime));
</script>

<template>
  <time
    :datetime="datetime"
    :title="showTooltip ? fullDate : undefined"
    class="text-gray-400 dark:text-gray-500 tabular-nums"
  >
    {{ relativeTime }}
  </time>
</template>
