<script setup lang="ts">
import type { NavIconName } from './types';
import {
  PhArrowLeft,
  PhBell,
  PhBookmarkSimple,
  PhChatCircle,
  PhDotsThreeVertical,
  PhFunnel,
  PhGear,
  PhHeart,
  PhHouse,
  PhList,
  PhMagnifyingGlass,
  PhPencilSimple,
  PhPlusSquare,
  PhShareNetwork,
  PhSparkle,
  PhUser,
  PhX,
} from '@phosphor-icons/vue';
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  name: NavIconName;
  size?: number;
  weight?: 'regular' | 'fill';
}>(), {
  size: 24,
  weight: 'regular',
});

const iconMap: Record<string, any> = {
  'home': PhHouse,
  'search': PhMagnifyingGlass,
  'explore': PhMagnifyingGlass,
  'new-post': PhPlusSquare,
  'notifications': PhBell,
  'profile': PhUser,
  'chat': PhChatCircle,
  'messages': PhChatCircle,
  'favourites': PhHeart,
  'saved': PhBookmarkSimple,
  'bookmarks': PhBookmarkSimple,
  'settings': PhGear,
  'menu': PhList,
  'close': PhX,
  'back': PhArrowLeft,
  'more': PhDotsThreeVertical,
  'compose': PhPencilSimple,
  'share': PhShareNetwork,
  'filter': PhFunnel,
  'feedback': PhSparkle,
};

const icon = computed(() => iconMap[props.name]);
</script>

<template>
  <component
    :is="icon"
    v-if="icon"
    :size="size"
    :weight="weight"
  />
</template>
