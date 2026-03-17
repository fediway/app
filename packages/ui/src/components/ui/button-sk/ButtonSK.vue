<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { ButtonSKVariants } from '.';
import { buttonSKVariants } from '.';
import { cn } from '../../../lib/utils';

interface Props {
  size?: ButtonSKVariants['size'];
  variant?: ButtonSKVariants['variant'];
  disabled?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  size: 'L',
  variant: 'Text',
  disabled: false,
});
</script>

<template>
  <button
    data-slot="button-sk"
    type="button"
    :disabled="disabled"
    :class="cn(buttonSKVariants({ size, variant }), props.class)"
  >
    <span
      v-if="variant === 'IconLeft' || variant === 'IconOnly'"
      class="inline-flex shrink-0"
    >
      <slot name="icon" />
    </span>

    <span v-if="variant !== 'IconOnly'">
      <slot />
    </span>

    <span
      v-if="variant === 'IconRight'"
      class="inline-flex shrink-0"
    >
      <slot name="icon" />
    </span>
  </button>
</template>
