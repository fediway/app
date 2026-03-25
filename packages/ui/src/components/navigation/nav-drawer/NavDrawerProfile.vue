<script setup lang="ts">
import Avatar from '../../ui/avatar/Avatar.vue';

defineProps<{
  avatar?: string;
  name: string;
  handle: string;
}>();
</script>

<template>
  <div class="flex flex-col items-center px-4 pb-6 pt-8">
    <Avatar :src="avatar" :alt="name" size="lg" class="mb-3" />
    <div class="text-base font-semibold text-foreground">
      {{ name }}
    </div>
    <div class="text-sm text-muted-foreground">
      {{ handle }}
    </div>
  </div>
</template>
