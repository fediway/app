<script setup lang="ts">
interface Props {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

withDefaults(defineProps<Props>(), {
  src: null,
  alt: 'Avatar',
  size: 'md',
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
    class="rounded-full border border-border bg-muted overflow-hidden shrink-0" :class="[
      sizeClasses[size],
    ]"
    role="img"
    :aria-label="alt"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="w-full h-full object-cover"
    >
  </div>
</template>
