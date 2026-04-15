<script setup lang="ts">
import { computed } from 'vue';
import { formatCompactTimestamp, formatFullDate } from '../../../utils/date';

interface Props {
  /** ISO 8601 datetime string */
  datetime: string;
  /** Whether to show full date on hover */
  showTooltip?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showTooltip: true,
});

const relativeTime = computed(() => formatCompactTimestamp(props.datetime));
const fullDate = computed(() => formatFullDate(props.datetime));
</script>

<template>
  <time
    :datetime="datetime"
    :title="showTooltip ? fullDate : undefined"
    class="text-muted-foreground tabular-nums"
  >
    {{ relativeTime }}
  </time>
</template>
