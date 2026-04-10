<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  icon: Component;
  label?: string;
  href?: string;
  main?: boolean;
  active?: boolean;
  badge?: number | string;
  dot?: boolean;
  ariaLabel?: string;
}>();

defineEmits<{
  click: [];
}>();
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :aria-label="ariaLabel ?? label"
    class="relative flex w-11 shrink-0 cursor-pointer flex-col items-center"
    :class="main ? 'h-11 justify-center rounded-full bg-secondary' : 'gap-0.5'"
    @click="$emit('click')"
  >
    <span class="relative">
      <component :is="icon" :size="24" :weight="active ? 'fill' : 'regular'" class="shrink-0" />
      <span
        v-if="badge"
        class="absolute -right-1.5 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-galaxy-500 px-1 text-[10px] font-bold leading-none text-white"
      >
        {{ typeof badge === 'number' && badge > 99 ? '99+' : badge }}
      </span>
      <span
        v-else-if="dot"
        class="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-galaxy-500"
        aria-label="New notifications"
      />
    </span>
    <span v-if="!main && label" class="text-xs text-foreground">
      {{ label }}
    </span>
  </component>
</template>
