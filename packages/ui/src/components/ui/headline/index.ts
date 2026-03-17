import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as Headline } from './Headline.vue';

// Type scale from globals.css Text Style Reference:
// H1: text-xl font-bold  (22px/700)
// H2: text-lg font-bold  (18px/700)
// H3: text-base font-bold (16px/700)
export const headlineVariants = cva('font-bold leading-normal text-primary', {
  variants: {
    level: {
      h1: 'text-xl',
      h2: 'text-lg',
      h3: 'text-base',
    },
  },
  defaultVariants: {
    level: 'h2',
  },
});

export type HeadlineVariants = VariantProps<typeof headlineVariants>;
