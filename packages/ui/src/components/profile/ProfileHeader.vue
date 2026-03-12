<script setup lang="ts">
import { PhArrowLeft } from '@phosphor-icons/vue';
import Avatar from '../primitives/Avatar.vue';

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
    <!-- Header Banner Image -->
    <div class="w-full h-[157px] overflow-hidden bg-gray-200">
      <img
        v-if="headerImage"
        :src="headerImage"
        alt="Profile header"
        class="w-full h-full object-cover"
      >
    </div>

    <!-- Back Button -->
    <button
      class="absolute top-[50px] left-3 flex items-center justify-center w-[44px] h-[44px] rounded-full bg-[#F6F3EB] cursor-pointer hover:bg-[#ede9df] transition-colors"
      aria-label="Go back"
      @click="$emit('back')"
    >
      <PhArrowLeft :size="20" />
    </button>

    <!-- Profile Avatar -->
    <div class="absolute left-4 bottom-0 translate-y-1/2">
      <Avatar
        :src="avatarSrc"
        :alt="avatarAlt"
        class="!w-[100px] !h-[100px] !border-[#EDE6D6]"
      />
    </div>

    <!-- Badge slot (bottom-right, below header image) -->
    <slot name="badge" />
  </div>
</template>
