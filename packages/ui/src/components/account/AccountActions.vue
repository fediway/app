<script setup lang="ts">
import type { Relationship } from '@repo/types';
import { computed } from 'vue';

interface Props {
  /** Current relationship with the account */
  relationship?: Relationship | null;
  /** Whether this is the authenticated user's own profile */
  isOwnProfile?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  relationship: null,
  isOwnProfile: false,
});

const emit = defineEmits<{
  follow: [];
  unfollow: [];
  moreOptions: [];
  editProfile: [];
}>();

const isFollowing = computed(() => props.relationship?.following ?? false);
const isRequested = computed(() => props.relationship?.requested ?? false);

function handleFollowClick() {
  if (isFollowing.value) {
    emit('unfollow');
  }
  else {
    emit('follow');
  }
}

const followButtonText = computed(() => {
  if (isRequested.value)
    return 'Requested';
  if (isFollowing.value)
    return 'Following';
  return 'Follow';
});
</script>

<template>
  <div class="flex justify-end gap-2">
    <!-- Edit Profile button for own profile -->
    <button
      v-if="isOwnProfile"
      type="button"
      class="inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-semibold cursor-pointer min-w-[100px] transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
      @click="emit('editProfile')"
    >
      Edit Profile
    </button>

    <!-- Follow/Unfollow button for other profiles -->
    <template v-else>
      <button
        type="button"
        class="inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-semibold cursor-pointer min-w-[100px] transition-colors" :class="[
          isFollowing || isRequested
            ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-red-300 hover:text-red-600'
            : 'bg-gray-900 border border-gray-900 text-white hover:bg-gray-700',
        ]"
        @click="handleFollowClick"
      >
        {{ followButtonText }}
      </button>
    </template>

    <!-- More options button -->
    <button
      type="button"
      class="inline-flex items-center justify-center p-2 border border-gray-300 rounded-full bg-white cursor-pointer w-10 h-10 hover:bg-gray-50 transition-colors"
      @click="emit('moreOptions')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="text-gray-600">
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
      </svg>
    </button>
  </div>
</template>
