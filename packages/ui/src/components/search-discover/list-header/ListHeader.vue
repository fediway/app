<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '../../../lib/utils';
import { ButtonText } from '../../ui/button-text';
import { Headline } from '../../ui/headline';

interface Props {
  title: string;
  actionLabel?: string;
  showAction?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  actionLabel: 'View all',
  showAction: true,
});

defineEmits<{
  action: [];
}>();
</script>

<template>
  <div
    data-slot="list-header"
    :class="cn('flex min-h-9 items-center justify-between', props.class)"
  >
    <Headline level="h2">
      {{ title }}
    </Headline>

    <ButtonText
      v-if="showAction"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </ButtonText>
  </div>
</template>
