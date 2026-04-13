<script setup lang="ts">
/**
 * Internal primitive that renders the avatar column's rail geometry around
 * a slotted center element. Owns the `12px top slot + center + flex-1 bottom
 * slot` layout and the `bg-border` rail color. Consumed by `ThreadAvatarColumn`,
 * `DeletedStatusTombstone`, and `ThreadCollapseNode` so every column in a
 * thread shares identical rail positioning.
 *
 * Not exported from the package — callers use one of the three public
 * column components instead.
 */
interface Props {
  connectAbove?: boolean;
  connectBelow?: boolean;
}

withDefaults(defineProps<Props>(), {
  connectAbove: false,
  connectBelow: false,
});
</script>

<template>
  <div class="flex shrink-0 flex-col items-center self-stretch">
    <div
      class="h-3 w-0.5"
      :class="connectAbove ? 'bg-border' : ''"
      aria-hidden="true"
    />
    <slot />
    <div
      class="w-0.5 flex-1"
      :class="connectBelow ? 'bg-border' : ''"
      aria-hidden="true"
    />
  </div>
</template>
