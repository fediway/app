import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as TagItem } from './TagItem.vue';

export const tagItemVariants = cva(
  'inline-flex h-5 items-center gap-0.5 rounded-full px-2 text-xs font-medium text-primary [&_svg]:size-4',
  {
    variants: {
      variant: {
        blue: 'bg-blue-background [&_svg]:text-blue-foreground',
        green: 'bg-green-background [&_svg]:text-green-foreground',
        red: 'bg-red-background [&_svg]:text-red-foreground',
        yellow: 'bg-yellow-background [&_svg]:text-yellow',
        gray: 'bg-gray-background [&_svg]:text-gray-foreground',
      },
    },
    defaultVariants: {
      variant: 'blue',
    },
  },
);
export type TagItemVariants = VariantProps<typeof tagItemVariants>;
