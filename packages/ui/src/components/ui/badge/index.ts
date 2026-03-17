import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as Badge } from './Badge.vue';

export const badgeVariants = cva(
  'inline-flex items-center px-3 py-1.5 rounded-[4px] text-sm font-normal whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-[#ede6d6] text-[#232b37]',
        primary: 'bg-primary text-white',
        secondary: 'bg-secondary text-primary',
        muted: 'bg-muted text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
