<script setup lang="ts">
import { PhArrowSquareOut, PhShareNetwork } from '@phosphor-icons/vue';
import Button from '../../ui/button/Button.vue';

defineEmits<{
  visit: [];
  share: [];
}>();
</script>

<template>
  <div class="flex items-center gap-3">
    <Button class="flex-1 gap-2" @click="$emit('visit')">
      <PhArrowSquareOut :size="18" />
      Visit
    </Button>
    <Button variant="secondary" size="icon" aria-label="Share" @click="$emit('share')">
      <PhShareNetwork :size="20" />
    </Button>
  </div>
</template>
