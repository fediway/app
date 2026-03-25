<script setup lang="ts">
import { ref } from 'vue';
import Button from '../ui/button/Button.vue';

const props = withDefaults(defineProps<{
  isFollowing: boolean;
  /** Follow request is pending approval (for locked/private accounts) */
  requested?: boolean;
  size?: 'sm' | 'md';
  loading?: boolean;
}>(), {
  requested: false,
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
    :variant="isFollowing || props.requested ? 'muted' : 'secondary'"
    :disabled="loading || props.requested"
    class="shrink-0"
    :class="[
      isFollowing && isHovered && 'border-red text-red hover:bg-red-background',
    ]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="isFollowing ? $emit('unfollow') : $emit('follow')"
  >
    {{ loading ? '...' : props.requested ? 'Requested' : isFollowing ? (isHovered ? 'Unfollow' : 'Following') : 'Follow' }}
  </Button>
</template>
