<script setup lang="ts">
import type { Component } from 'vue';
import MainNavigationItem from './MainNavigationItem.vue';

export interface NavItem {
  id?: string;
  icon: Component;
  label?: string;
  href?: string;
  main?: boolean;
  active?: boolean;
}

defineProps<{
  items: NavItem[];
}>();

defineEmits<{
  itemClick: [item: NavItem, index: number];
}>();
</script>

<template>
  <nav class="flex flex-1 items-center justify-between rounded-full bg-white px-6 py-3 shadow-[2px_2px_17px_0_rgb(0_0_0/0.15)]">
    <MainNavigationItem
      v-for="(item, i) in items"
      :key="item.id ?? i"
      :icon="item.icon"
      :label="item.label"
      :href="item.href"
      :main="item.main"
      :active="item.active"
      @click="$emit('itemClick', item, i)"
    />
  </nav>
</template>
