<script setup lang="ts">
defineProps<{
  reblogsCount: number;
  favouritesCount: number;
}>();
</script>

<template>
  <div v-if="reblogsCount > 0 || favouritesCount > 0" class="flex gap-6 py-3 text-sm">
    <div v-if="reblogsCount > 0">
      <span class="font-semibold text-gray-900 dark:text-gray-100">{{ reblogsCount }}</span>
      <span class="ml-1 text-gray-500">Reblogs</span>
    </div>
    <div v-if="favouritesCount > 0">
      <span class="font-semibold text-gray-900 dark:text-gray-100">{{ favouritesCount }}</span>
      <span class="ml-1 text-gray-500">Likes</span>
    </div>
  </div>
</template>
