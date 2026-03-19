<script setup lang="ts">
import NavIcon from '../NavIcon.vue';

defineProps<{
  icon: string;
  label: string;
  active?: boolean;
  badge?: number | string;
}>();

defineEmits<{ click: [] }>();
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-4 rounded-lg border-none bg-transparent px-4 py-3.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    :class="[
      active
        ? 'bg-gray-50 font-semibold text-gray-900 dark:bg-gray-800 dark:text-gray-100'
        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
    ]"
    :aria-current="active ? 'page' : undefined"
    @click="$emit('click')"
  >
    <NavIcon :name="(icon as any)" :size="22" />
    <span class="flex-1 text-base">{{ label }}</span>
    <span
      v-if="badge"
      class="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white"
    >
      {{ badge }}
    </span>
  </button>
</template>
