import type { Meta, StoryObj } from '@storybook/vue3';
import { Skeleton } from '@/components/ui/skeleton';

const meta = {
  title: '4-Layout/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextLine: Story = {
  args: { class: 'h-4 w-3/4' },
};

export const AvatarShape: Story = {
  args: { class: 'h-12 w-12 rounded-full' },
};

export const ImagePlaceholder: Story = {
  args: { class: 'h-40 w-full rounded-lg' },
};

export const CardComposition: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="flex gap-3 p-4">
        <Skeleton class="h-10 w-10 rounded-full shrink-0" />
        <div class="flex-1 space-y-2">
          <Skeleton class="h-4 w-1/3" />
          <Skeleton class="h-3 w-1/4" />
          <Skeleton class="h-3 w-full mt-3" />
          <Skeleton class="h-3 w-5/6" />
          <Skeleton class="h-40 w-full rounded-lg mt-3" />
        </div>
      </div>
    `,
  }),
};
