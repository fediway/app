import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as Divider } from './Divider.vue';

export const dividerVariants = cva('shrink-0 bg-border', {
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'w-px h-full',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export type DividerVariants = VariantProps<typeof dividerVariants>;
