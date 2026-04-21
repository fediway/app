<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  alt: 'Avatar',
  size: 'md',
});

const hasError = ref(false);

watch(() => props.src, () => {
  hasError.value = false;
});

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-11 h-11',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};
</script>

<template>
  <div
    class="aspect-square rounded-full border border-border bg-muted overflow-hidden shrink-0" :class="[
      sizeClasses[size],
    ]"
    role="img"
    :aria-label="alt"
  >
    <img
      v-if="src && !hasError"
      :src="src"
      :alt="alt"
      decoding="async"
      class="w-full h-full object-cover"
      @error="hasError = true"
    >
  </div>
</template>
