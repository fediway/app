<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '../../../lib/utils';
import { ButtonText } from '../button-text';
import { Headline } from '../headline';

interface Props {
  title: string;
  actionLabel?: string;
  showAction?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  actionLabel: 'View all',
  showAction: false,
});

defineEmits<{
  action: [];
}>();
</script>

<template>
  <section
    data-slot="section"
    :class="cn('flex flex-col', props.class)"
  >
    <!-- Header -->
    <div class="flex min-h-9 items-center justify-between px-5">
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

    <!-- Content -->
    <div class="mt-2">
      <slot />
    </div>
  </section>
</template>
