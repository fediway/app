<script setup lang="ts">
import Avatar from '../ui/avatar/Avatar.vue';

defineProps<{
  name: string;
  username: string;
  avatar?: string;
}>();

defineEmits<{
  click: [];
}>();
</script>

<template>
  <div class="flex flex-col items-center" @click="$emit('click')">
    <Avatar :src="avatar" :alt="name" size="lg" class="mb-3" />
    <div class="text-base font-semibold text-gray-900 dark:text-gray-100">
      {{ name }}
    </div>
    <div class="text-sm text-gray-500">
      @{{ username }}
    </div>
  </div>
</template>
