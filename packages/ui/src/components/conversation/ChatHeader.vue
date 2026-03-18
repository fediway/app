<script setup lang="ts">
import { PhArrowLeft } from '@phosphor-icons/vue';
import Avatar from '../primitives/Avatar.vue';
import Button from '../ui/button/Button.vue';

defineProps<{
  participant: {
    avatar: string;
    displayName: string;
    acct: string;
  };
}>();

defineEmits<{
  back: [];
}>();
</script>

<template>
  <div class="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
    <Button variant="muted" size="icon" class="-ml-2 size-9" @click="$emit('back')">
      <PhArrowLeft :size="20" />
    </Button>
    <Avatar :src="participant.avatar" :alt="participant.displayName" size="md" />
    <div class="min-w-0 flex-1">
      <div class="truncate font-semibold text-gray-900 dark:text-gray-100">
        {{ participant.displayName }}
      </div>
      <div class="truncate text-xs text-gray-500">
        @{{ participant.acct }}
      </div>
    </div>
  </div>
</template>
