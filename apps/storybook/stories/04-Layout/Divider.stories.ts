import type { Meta, StoryObj } from '@storybook/vue3';
import { Divider } from '@/components/ui/divider';

const meta = {
  title: '04-Layout/Divider',
  component: Divider,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
  args: {
    orientation: 'horizontal',
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
};

export const Vertical: Story = {
  render: () => ({
    components: { Divider },
    template: `
      <div class="flex items-center gap-4 h-8">
        <span class="text-sm text-primary/80">Left</span>
        <Divider orientation="vertical" />
        <span class="text-sm text-primary/80">Right</span>
      </div>
    `,
  }),
};

export const BetweenContent: Story = {
  render: () => ({
    components: { Divider },
    template: `
      <div class="flex flex-col gap-3 max-w-sm">
        <p class="text-sm text-primary/80">Section one content goes here.</p>
        <Divider />
        <p class="text-sm text-primary/80">Section two content goes here.</p>
        <Divider />
        <p class="text-sm text-primary/80">Section three content goes here.</p>
      </div>
    `,
  }),
};
