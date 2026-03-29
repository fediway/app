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
  <div v-if="reblogsCount > 0 || favouritesCount > 0" class="flex gap-6 text-sm">
    <button v-if="reblogsCount > 0" class="hover:underline" @click="$emit('reblogs')">
      <span class="font-semibold text-foreground">{{ reblogsCount }}</span>
      <span class="ml-1 text-muted-foreground">{{ reblogsCount === 1 ? 'Repost' : 'Reposts' }}</span>
    </button>
    <button v-if="favouritesCount > 0" class="hover:underline" @click="$emit('favourites')">
      <span class="font-semibold text-foreground">{{ favouritesCount }}</span>
      <span class="ml-1 text-muted-foreground">{{ favouritesCount === 1 ? 'Like' : 'Likes' }}</span>
    </button>
  </div>
</template>
