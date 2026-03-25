<script setup lang="ts">
import { PhArrowLeft } from '@phosphor-icons/vue';
import Avatar from '../ui/avatar/Avatar.vue';
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
  <div class="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
    <Button variant="muted" size="icon" class="-ml-2 size-9" @click="$emit('back')">
      <PhArrowLeft :size="20" />
    </Button>
    <Avatar :src="participant.avatar" :alt="participant.displayName" size="md" />
    <div class="min-w-0 flex-1">
      <div class="truncate font-semibold text-foreground">
        {{ participant.displayName }}
      </div>
      <div class="truncate text-xs text-muted-foreground">
        @{{ participant.acct }}
      </div>
    </div>
  </div>
</template>
