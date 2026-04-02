<script setup lang="ts">
import { formatCount } from '../../../utils/format';
import Avatar from '../../ui/avatar/Avatar.vue';

defineProps<{
  avatar?: string;
  name: string;
  handle: string;
  followersCount?: number;
  followingCount?: number;
}>();

defineEmits<{
  profileClick: [];
  statClick: [stat: 'followers' | 'following'];
}>();
</script>

<template>
  <div class="flex flex-col">
    <!-- Gradient header background -->
    <div
      class="relative px-5 pb-5 pt-10"
      style="background-image: linear-gradient(138deg, rgba(53, 13, 255, 0.056) 15%, rgba(168, 0, 253, 0.07) 35%, rgba(191, 128, 255, 0.063) 69%, rgba(255, 255, 255, 0.07) 92%);"
    >
      <!-- Avatar + name — clickable to navigate to profile -->
      <button
        type="button"
        class="flex cursor-pointer items-center gap-3 text-left"
        @click="$emit('profileClick')"
      >
        <Avatar :src="avatar" :alt="name" size="lg" />
        <div class="min-w-0 flex-1">
          <div class="truncate text-base font-bold text-foreground">
            {{ name }}
          </div>
          <div class="truncate text-sm text-muted-foreground">
            {{ handle }}
          </div>
        </div>
      </button>

      <!-- Stats row -->
      <div v-if="followersCount != null || followingCount != null" class="mt-3 flex items-center gap-4">
        <button
          v-if="followersCount != null"
          type="button"
          class="flex cursor-pointer items-baseline gap-1 text-sm transition-colors hover:text-foreground"
          @click="$emit('statClick', 'followers')"
        >
          <span class="font-bold text-foreground">{{ formatCount(followersCount) }}</span>
          <span class="text-muted-foreground">Followers</span>
        </button>
        <button
          v-if="followingCount != null"
          type="button"
          class="flex cursor-pointer items-baseline gap-1 text-sm transition-colors hover:text-foreground"
          @click="$emit('statClick', 'following')"
        >
          <span class="font-bold text-foreground">{{ formatCount(followingCount) }}</span>
          <span class="text-muted-foreground">Following</span>
        </button>
      </div>
    </div>
  </div>
</template>
