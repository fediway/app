<script setup lang="ts">
import { PhArrowLeft } from '@phosphor-icons/vue';
import profileHeaderPlaceholder from '../../../assets/profile-header-placeholder.svg?url';
import Avatar from '../../primitives/Avatar.vue';
import { Badge } from '../../ui/badge';

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

defineEmits<{ back: [] }>();
</script>

<template>
  <div class="relative mb-16">
    <!-- Header Banner -->
    <div class="relative w-full h-[157px] overflow-hidden bg-border">
      <!-- Custom header image -->
      <img
        v-if="headerImage"
        :src="headerImage"
        alt="Profile header"
        class="w-full h-full object-cover"
      >

      <!-- Placeholder: decorative blob overlay -->
      <div
        v-else
        class="absolute left-[48px] top-[-103px] w-[308px] h-[328px]"
      >
        <img
          :src="profileHeaderPlaceholder"
          alt=""
          aria-hidden="true"
          class="absolute block max-w-none"
          style="top: -13.89%; right: -14.8%; bottom: -13.89%; left: -14.8%;"
        >
      </div>
    </div>

    <!-- Back Button -->
    <button
      class="absolute top-[45px] left-5 flex items-center justify-center w-[44px] h-[44px] rounded-full bg-muted cursor-pointer hover:bg-muted/80 transition-colors"
      aria-label="Go back"
      @click="$emit('back')"
    >
      <PhArrowLeft :size="24" />
    </button>

    <!-- Profile Avatar -->
    <div class="absolute left-5 bottom-0 translate-y-1/2">
      <Avatar
        :src="avatarSrc"
        :alt="avatarAlt"
        class="!w-[100px] !h-[100px] !border-border"
      />
    </div>

    <!-- Follows You Badge -->
    <Badge
      v-if="followsYou"
      class="absolute left-[calc(50%+77px)] top-[177px]"
    >
      Follows you
    </Badge>

    <!-- Additional badge/action slot -->
    <slot name="badge" />
  </div>
</template>
