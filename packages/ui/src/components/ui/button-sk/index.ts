import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as ButtonSK } from './ButtonSK.vue';

export const buttonSKVariants = cva(
  [
    'inline-flex items-center justify-center',
    'rounded-[999px]',
    'bg-[#ee0000] hover:bg-[#d40000] active:bg-[#aa0000]',
    'text-white text-base leading-5',
    'font-["Sparkasse_Medium"]',
    'min-w-[96px] max-w-[400px]',
    'cursor-pointer transition-colors',
    'select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071d4] focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  {
    variants: {
      size: {
        L: 'px-8 py-3.5 h-12',
        M: 'px-6 py-2 min-h-10',
      },
      variant: {
        Text: '',
        IconOnly: 'min-w-0',
        IconLeft: 'gap-1',
        IconRight: 'gap-1',
      },
    },
    compoundVariants: [
      { size: 'L', variant: 'IconOnly', class: 'p-3 w-12' },
      { size: 'M', variant: 'IconOnly', class: 'p-2 w-10' },
    ],
    defaultVariants: {
      size: 'L',
      variant: 'Text',
    },
  },
);

export type ButtonSKVariants = VariantProps<typeof buttonSKVariants>;
