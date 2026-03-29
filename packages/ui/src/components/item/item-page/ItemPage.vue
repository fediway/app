<script setup lang="ts">
import type { Item } from '@repo/types';
import ItemPageHeaderLink from './ItemPageHeaderLink.vue';

// Future: import ItemPageHeaderMovie, ItemPageHeaderSong, etc.

interface Props {
  item: Item;
}

defineProps<Props>();

defineEmits<{
  visit: [];
  share: [];
  back: [];
}>();

// Map item types to header components
// For now only 'link' is implemented — others fall back to link layout
const headerComponents: Partial<Record<import('@repo/types').ItemType, typeof ItemPageHeaderLink>> = {
  link: ItemPageHeaderLink,
};
</script>

<template>
  <div class="w-full">
    <!-- Type-specific header -->
    <component
      :is="headerComponents[item.type] ?? ItemPageHeaderLink"
      :item="item"
      @visit="$emit('visit')"
      @share="$emit('share')"
      @back="$emit('back')"
    />

    <!-- Feed content -->
    <slot />
  </div>
</template>
