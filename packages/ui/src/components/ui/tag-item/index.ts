import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as TagItem } from './TagItem.vue';

export const tagItemVariants = cva(
  'inline-flex h-5 items-center gap-0.5 rounded px-1 text-xs font-medium text-primary [&_svg]:size-4',
  {
    variants: {
      variant: {
        blue: 'bg-[#DFEBF7] [&_svg]:text-[#2877CB]',
        green: 'bg-[#DEEDDD] [&_svg]:text-[#228419]',
        red: 'bg-[#FBDCDC] [&_svg]:text-[#C23737]',
        yellow: 'bg-[#F7EDCF] [&_svg]:text-[#B8920C]',
        gray: 'bg-[#EBEBEB] [&_svg]:text-[#6B7280]',
      },
    },
    defaultVariants: {
      variant: 'blue',
    },
  },
);
export type TagItemVariants = VariantProps<typeof tagItemVariants>;
