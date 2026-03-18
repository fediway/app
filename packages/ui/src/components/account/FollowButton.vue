<script setup lang="ts">
import { ref } from 'vue';
import Button from '../ui/button/Button.vue';

withDefaults(defineProps<{
  isFollowing: boolean;
  size?: 'sm' | 'md';
  loading?: boolean;
}>(), {
  size: 'sm',
  loading: false,
});

defineEmits<{
  follow: [];
  unfollow: [];
}>();

const isHovered = ref(false);
</script>

<template>
  <Button
    :size="size === 'sm' ? 'sm' : 'default'"
    :variant="isFollowing ? 'secondary' : 'default'"
    :disabled="loading"
    class="shrink-0"
    :class="[
      isFollowing && isHovered && 'border-red-300 text-red-600 hover:bg-white dark:hover:bg-transparent',
    ]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="isFollowing ? $emit('unfollow') : $emit('follow')"
  >
    {{ loading ? '...' : isFollowing ? (isHovered ? 'Unfollow' : 'Following') : 'Follow' }}
  </Button>
</template>
