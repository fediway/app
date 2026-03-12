<script setup lang="ts">
interface Props {
  statusesCount: number;
  followersCount: number;
  followingCount: number;
}

defineProps<Props>();

const TRAILING_ZERO_RE = /\.0$/;

function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1).replace(TRAILING_ZERO_RE, '')}m`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(TRAILING_ZERO_RE, '')}k`;
  }
  return count.toString();
}
</script>

<template>
  <div class="flex gap-4 text-sm">
    <button type="button" class="flex items-center gap-1 bg-transparent border-none cursor-pointer hover:underline transition-opacity">
      <span class="font-bold text-gray-900">{{ formatCount(statusesCount) }}</span>
      <span class="text-gray-500">Posts</span>
    </button>
    <button type="button" class="flex items-center gap-1 bg-transparent border-none cursor-pointer hover:underline transition-opacity">
      <span class="font-bold text-gray-900">{{ formatCount(followersCount) }}</span>
      <span class="text-gray-500">Followers</span>
    </button>
    <button type="button" class="flex items-center gap-1 bg-transparent border-none cursor-pointer hover:underline transition-opacity">
      <span class="font-bold text-gray-900">{{ formatCount(followingCount) }}</span>
      <span class="text-gray-500">Following</span>
    </button>
  </div>
</template>
