import type { Meta, StoryObj } from '@storybook/vue3';
import { defineComponent } from 'vue';

const TypographyShowcase = defineComponent({
  name: 'TypographyShowcase',
  template: `
    <div class="flex flex-col gap-6 max-w-[600px]">
      <div>
        <p class="text-xs text-foreground/60 mb-1">H1 · text-xl font-bold · 22px/700</p>
        <p class="text-xl font-bold text-foreground">The quick brown fox jumps over the lazy dog</p>
      </div>
      <div>
        <p class="text-xs text-foreground/60 mb-1">H2 · text-lg font-bold · 18px/700</p>
        <p class="text-lg font-bold text-foreground">The quick brown fox jumps over the lazy dog</p>
      </div>
      <div>
        <p class="text-xs text-foreground/60 mb-1">H3 · text-base font-bold · 16px/700</p>
        <p class="text-base font-bold text-foreground">The quick brown fox jumps over the lazy dog</p>
      </div>
      <div>
        <p class="text-xs text-foreground/60 mb-1">Body · text-base leading-[22px] · 16px/400</p>
        <p class="text-base leading-[22px] text-foreground">The quick brown fox jumps over the lazy dog. This is body text used for status content, bios, and general reading. It should be comfortable to read at length.</p>
      </div>
      <div>
        <p class="text-xs text-foreground/60 mb-1">Caption · text-sm · 14px/400</p>
        <p class="text-sm text-foreground">The quick brown fox jumps over the lazy dog</p>
      </div>
      <div>
        <p class="text-xs text-foreground/60 mb-1">Navigation · text-xs · 12px/400</p>
        <p class="text-xs text-foreground">The quick brown fox jumps over the lazy dog</p>
      </div>
      <div>
        <p class="text-xs text-foreground/60 mb-1">Button · text-base font-semibold · 16px/600</p>
        <p class="text-base font-semibold text-foreground">Follow · Post · Cancel</p>
      </div>
      <div>
        <p class="text-xs text-foreground/60 mb-1">Button sm · text-sm font-semibold · 14px/600</p>
        <p class="text-sm font-semibold text-foreground">Follow · Post · Cancel</p>
      </div>
      <div>
        <p class="text-xs text-foreground/60 mb-1">Tab · text-base font-medium / font-bold · 16px/500-700</p>
        <div class="flex gap-4">
          <span class="text-base font-bold text-foreground">Active Tab</span>
          <span class="text-base font-medium text-foreground/60">Inactive Tab</span>
          <span class="text-base font-medium text-foreground/60">Inactive Tab</span>
        </div>
      </div>
    </div>
  `,
});

const meta = {
  title: '01-Foundations/Typography',
  component: TypographyShowcase,
  tags: ['autodocs'],
} satisfies Meta<typeof TypographyShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllStyles: Story = {};
