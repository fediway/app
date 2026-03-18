<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  icon: Component;
  label?: string;
  href?: string;
  main?: boolean;
  active?: boolean;
}>();

defineEmits<{
  click: [];
}>();
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    class="flex w-10 shrink-0 cursor-pointer flex-col items-center"
    :class="main ? 'h-10 justify-center rounded-full bg-secondary' : 'gap-0.5'"
    @click="$emit('click')"
  >
    <component :is="icon" :size="24" :weight="active ? 'fill' : 'regular'" class="shrink-0" />
    <span v-if="!main && label" class="text-xs text-[#232B37]">
      {{ label }}
    </span>
  </component>
</template>
