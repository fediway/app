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
    <div class="text-base font-semibold text-foreground">
      {{ name }}
    </div>
    <div class="text-sm text-muted-foreground">
      @{{ username }}
    </div>
  </div>
</template>
