import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as TabBar } from './TabBar.vue';

export interface TabItem {
  label: string;
  value: string;
}

export const tabItemVariants = cva(
  'min-w-max shrink-0 cursor-pointer flex items-center justify-center px-3 py-3 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
  {
    variants: {
      active: {
        true: 'font-bold text-primary',
        false: 'font-medium text-primary/80 hover:text-primary',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

export type TabItemVariants = VariantProps<typeof tabItemVariants>;
