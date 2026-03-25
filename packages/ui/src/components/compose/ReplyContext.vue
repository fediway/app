<script setup lang="ts">
import { PhChatCircle } from '@phosphor-icons/vue';

defineProps<{
  acct: string;
}>();
</script>

<template>
  <div class="flex items-center gap-2 text-sm text-muted-foreground">
    <PhChatCircle :size="16" />
    <span>Replying to <strong class="text-foreground">@{{ acct }}</strong></span>
  </div>
</template>
