<script setup lang="ts">
defineProps<{
  reblogsCount: number;
  favouritesCount: number;
}>();

defineEmits<{
  reblogs: [];
  favourites: [];
}>();
</script>

<template>
  <div v-if="reblogsCount > 0 || favouritesCount > 0" class="flex gap-6 py-3 text-sm">
    <button v-if="reblogsCount > 0" class="hover:underline" @click="$emit('reblogs')">
      <span class="font-semibold text-gray-900 dark:text-gray-100">{{ reblogsCount }}</span>
      <span class="ml-1 text-gray-500">{{ reblogsCount === 1 ? 'Reblog' : 'Reblogs' }}</span>
    </button>
    <button v-if="favouritesCount > 0" class="hover:underline" @click="$emit('favourites')">
      <span class="font-semibold text-gray-900 dark:text-gray-100">{{ favouritesCount }}</span>
      <span class="ml-1 text-gray-500">{{ favouritesCount === 1 ? 'Like' : 'Likes' }}</span>
    </button>
  </div>
</template>
