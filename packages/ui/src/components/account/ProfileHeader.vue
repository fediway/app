<script setup lang="ts">
import { vFadeOnLoad } from '../../directives/fadeOnLoad';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface Props {
  headerImage?: string | null;
  avatarSrc?: string | null;
  avatarAlt?: string;
  followsYou?: boolean;
}

withDefaults(defineProps<Props>(), {
  headerImage: null,
  avatarSrc: null,
  avatarAlt: 'Avatar',
  followsYou: false,
});
</script>

<template>
  <div class="relative">
    <!-- Header Banner — gradient fallback always behind, image covers when loaded -->
    <div
      class="relative w-full h-[157px] overflow-hidden bg-muted"
      style="background-image: linear-gradient(138deg, rgba(53, 13, 255, 0.056) 15%, rgba(168, 0, 253, 0.07) 35%, rgba(191, 128, 255, 0.063) 69%, rgba(255, 255, 255, 0.07) 92%);"
    >
      <img
        v-if="headerImage"
        v-fade-on-load
        :src="headerImage"
        alt="Profile header"
        decoding="async"
        class="w-full h-full object-cover"
      >
    </div>

    <!-- Content below banner -->
    <div class="flex items-start justify-between px-5">
      <!-- Profile Avatar -->
      <div class="-mt-[50px] -ml-1.5 relative z-10">
        <Avatar
          :src="avatarSrc"
          :alt="avatarAlt"
          class="!w-[100px] !h-[100px] !border-border"
        />
      </div>

      <div class="flex items-center gap-2 mt-3">
        <!-- Follows You Badge -->
        <Badge v-if="followsYou">
          Follows you
        </Badge>

        <!-- Additional badge/action slot -->
        <slot name="badge" />
      </div>
    </div>
  </div>
</template>
