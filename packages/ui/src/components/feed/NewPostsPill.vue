<script setup lang="ts">
defineProps<{
  count: number;
  avatars?: string[];
}>();

defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    class="flex cursor-pointer items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80"
    @click="$emit('click')"
  >
    <div v-if="avatars?.length" class="flex -space-x-1.5">
      <img
        v-for="(avatar, i) in avatars.slice(0, 3)"
        :key="i"
        :src="avatar"
        alt=""
        class="size-5 rounded-full ring-2 ring-secondary object-cover"
        loading="lazy"
        decoding="async"
      >
    </div>
    {{ count }} new {{ count === 1 ? 'post' : 'posts' }}
  </button>
</template>
