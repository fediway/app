<script setup lang="ts">
import StatusSkeleton from './StatusSkeleton.vue';

interface Props {
  /**
   * Number of ancestor skeletons to render above the focused row.
   * Default 1 — covers the most common case (single-parent reply detail page).
   */
  ancestors?: number;
  /**
   * Number of descendant skeletons to render below.
   * Default 3 — gives a believable "thread is loading" preview.
   */
  descendants?: number;
}

withDefaults(defineProps<Props>(), {
  ancestors: 1,
  descendants: 3,
});
</script>

<template>
  <div aria-busy="true" aria-label="Loading thread">
    <StatusSkeleton
      v-for="n in ancestors"
      :key="`a-${n}`"
      :thread-position="n === 1 ? { kind: 'chain-start' } : { kind: 'chain-middle' }"
      :show-separator="false"
      :lines="2"
    />
    <StatusSkeleton :show-separator="false" :lines="3" />
    <StatusSkeleton
      v-for="n in descendants"
      :key="`d-${n}`"
      :show-separator="n === descendants"
      :lines="2"
    />
  </div>
</template>
