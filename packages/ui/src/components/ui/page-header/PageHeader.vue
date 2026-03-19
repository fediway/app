<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { PhArrowLeft } from '@phosphor-icons/vue';
import { cn } from '../../../lib/utils';
import Button from '../button/Button.vue';

interface Props {
  title: string;
  subtitle?: string;
  /** Show a back button before the title */
  showBack?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: undefined,
  showBack: false,
});

defineEmits<{
  back: [];
}>();
</script>

<template>
  <header
    :class="cn(
      'sticky top-0 z-10 border-b border-border bg-card/80 px-4 py-3 backdrop-blur',
      props.class,
    )"
  >
    <div class="flex items-center gap-3">
      <Button
        v-if="showBack"
        variant="muted"
        size="icon"
        class="-ml-2 size-9"
        @click="$emit('back')"
      >
        <PhArrowLeft :size="20" />
      </Button>
      <div class="min-w-0 flex-1">
        <h1 class="truncate text-xl font-bold text-foreground">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="truncate text-sm text-foreground/60">
          {{ subtitle }}
        </p>
      </div>
      <div v-if="$slots.actions">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>
