<script setup lang="ts">
import { PhDotsThree } from '@phosphor-icons/vue';

interface Props {
  following?: boolean;
  requested?: boolean;
  isOwnProfile?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  following: false,
  requested: false,
  isOwnProfile: false,
});

defineEmits<{
  follow: [];
  unfollow: [];
  message: [];
  more: [];
  editProfile: [];
}>();
</script>

<template>
  <div class="flex items-center gap-3 px-5">
    <template v-if="isOwnProfile">
      <button
        type="button"
        class="flex-1 h-[44px] flex items-center justify-center rounded-full text-base font-semibold cursor-pointer transition-colors bg-muted text-foreground hover:bg-accent"
        @click="$emit('editProfile')"
      >
        Edit Profile
      </button>
    </template>

    <template v-else>
      <button
        type="button"
        class="flex-1 h-[44px] flex items-center justify-center rounded-full text-base font-semibold cursor-pointer transition-colors"
        :class="[
          props.following || props.requested
            ? 'bg-muted text-foreground hover:bg-accent'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ]"
        @click="props.following ? $emit('unfollow') : $emit('follow')"
      >
        {{ props.requested ? 'Requested' : props.following ? 'Following' : 'Follow' }}
      </button>

      <button
        type="button"
        class="flex-1 h-[44px] flex items-center justify-center rounded-full text-base font-semibold cursor-pointer transition-colors bg-secondary text-foreground hover:bg-secondary/80"
        @click="$emit('message')"
      >
        Message
      </button>

      <button
        type="button"
        class="size-[44px] shrink-0 flex items-center justify-center rounded-full cursor-pointer transition-colors bg-muted text-foreground hover:bg-accent"
        aria-label="More options"
        @click="$emit('more')"
      >
        <PhDotsThree :size="24" weight="bold" />
      </button>
    </template>
  </div>
</template>
