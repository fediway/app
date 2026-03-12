<script setup lang="ts">
import {
  PhArrowLeft,
  PhBell,
  PhBookmarkSimple,
  PhChatCircle,
  PhGear,
  PhHeart,
  PhHouse,
  PhList,
  PhMagnifyingGlass,
  PhPlusSquare,
  PhUser,
  PhX,
} from '@phosphor-icons/vue';
import { computed } from 'vue';

interface Props {
  name: string;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
});

const iconMap: Record<string, any> = {
  'home': PhHouse,
  'search': PhMagnifyingGlass,
  'explore': PhMagnifyingGlass,
  'new-post': PhPlusSquare,
  'notifications': PhBell,
  'profile': PhUser,
  'chat': PhChatCircle,
  'favourites': PhHeart,
  'saved': PhBookmarkSimple,
  'settings': PhGear,
  'menu': PhList,
  'close': PhX,
  'back': PhArrowLeft,
};

const icon = computed(() => iconMap[props.name]);
</script>

<template>
  <component
    :is="icon"
    v-if="icon"
    :size="size"
    weight="regular"
  />
</template>
