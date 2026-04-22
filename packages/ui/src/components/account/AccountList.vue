<script setup lang="ts">
import type { CustomEmoji } from '@repo/types';
import type { HTMLAttributes } from 'vue';
import { cn } from '../../lib/utils';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import AccountDisplayName from './AccountDisplayName.vue';

export interface UserSuggestion {
  displayName: string;
  handle: string;
  avatarSrc?: string | null;
  avatarAlt?: string;
  emojis?: readonly CustomEmoji[];
}

interface Props {
  users: UserSuggestion[];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {});

defineEmits<{
  follow: [handle: string];
  userClick: [handle: string];
}>();
</script>

<template>
  <ul
    data-slot="user-suggestions"
    :class="cn('flex flex-col', props.class)"
  >
    <li
      v-for="user in users"
      :key="user.handle"
      class="flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
      @click="$emit('userClick', user.handle)"
    >
      <Avatar
        :src="user.avatarSrc"
        :alt="user.avatarAlt ?? user.displayName"
        size="md"
        class="!border-border shrink-0"
      />

      <div class="min-w-0 flex-1">
        <AccountDisplayName
          :name="user.displayName"
          :emojis="user.emojis"
          class="block truncate text-base font-bold leading-tight text-primary"
        />
        <p class="truncate text-sm leading-tight text-primary/80">
          {{ user.handle }}
        </p>
      </div>

      <Button
        variant="secondary"
        size="sm"
        class="shrink-0 text-base"
        @click.stop="$emit('follow', user.handle)"
      >
        Follow
      </Button>
    </li>
  </ul>
</template>
