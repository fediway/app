<script setup lang="ts">
import { ref, watch } from 'vue';
import { formatCount } from '../../../utils/format';

const props = defineProps<{
  count: number;
  formatter?: (n: number) => string;
}>();

const direction = ref<'up' | 'down'>('up');
const displayCount = ref(props.count);

function format(n: number): string {
  return props.formatter ? props.formatter(n) : formatCount(n);
}

watch(() => props.count, (newVal, oldVal) => {
  direction.value = newVal > oldVal ? 'up' : 'down';
  displayCount.value = newVal;
});
</script>

<template>
  <span class="relative inline-flex overflow-hidden">
    <Transition :name="`count-${direction}`" mode="out-in">
      <span :key="displayCount" class="tabular-nums">
        {{ format(displayCount) }}
      </span>
    </Transition>
  </span>
</template>

<style scoped>
.count-up-enter-active,
.count-up-leave-active,
.count-down-enter-active,
.count-down-leave-active {
  transition: transform 150ms ease, opacity 150ms ease;
}

/* Count UP: old slides up and out, new slides in from below */
.count-up-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
.count-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

/* Count DOWN: old slides down and out, new slides in from above */
.count-down-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.count-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .count-up-enter-active,
  .count-up-leave-active,
  .count-down-enter-active,
  .count-down-leave-active {
    transition: none;
  }
}
</style>
