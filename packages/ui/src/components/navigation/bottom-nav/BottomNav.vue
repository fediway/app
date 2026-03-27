<script setup lang="ts">
import type { Component } from 'vue';
import BottomNavItem from './BottomNavItem.vue';

export interface BottomNavItemType {
  id?: string;
  icon: Component;
  label?: string;
  href?: string;
  main?: boolean;
  active?: boolean;
  badge?: number | string;
  dot?: boolean;
  ariaLabel?: string;
}

defineProps<{
  items: BottomNavItemType[];
}>();

defineEmits<{
  itemClick: [item: BottomNavItemType, index: number];
}>();
</script>

<template>
  <nav class="flex flex-1 items-center justify-between rounded-full bg-card px-6 py-3 shadow-[0_2px_16px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.4)]">
    <BottomNavItem
      v-for="(item, i) in items"
      :key="item.id ?? i"
      :icon="item.icon"
      :label="item.label"
      :href="item.href"
      :main="item.main"
      :active="item.active"
      :badge="item.badge"
      :dot="item.dot"
      :aria-label="item.ariaLabel ?? item.label"
      @click="$emit('itemClick', item, i)"
    />
  </nav>
</template>
