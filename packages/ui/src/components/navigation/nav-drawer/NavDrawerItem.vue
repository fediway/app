<script setup lang="ts">
import NavIcon from '../NavIcon.vue';

defineProps<{
  icon: string;
  label: string;
  active?: boolean;
  badge?: number | string;
  dot?: boolean;
}>();

defineEmits<{ click: [] }>();
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-4 rounded-full border-none bg-transparent px-4 py-3.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    :class="[
      active
        ? 'bg-muted font-bold text-foreground'
        : 'text-foreground hover:bg-muted',
    ]"
    :aria-current="active ? 'page' : undefined"
    @click="$emit('click')"
  >
    <NavIcon :name="(icon as any)" :size="22" :weight="active ? 'fill' : 'regular'" />
    <span class="flex-1 text-base">{{ label }}</span>
    <span
      v-if="badge"
      class="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-galaxy-500 px-1.5 text-xs font-medium text-white"
    >
      {{ badge }}
    </span>
    <span
      v-else-if="dot"
      class="ml-auto h-2.5 w-2.5 rounded-full bg-galaxy-500"
      aria-label="New notifications"
    />
  </button>
</template>
