import type { Meta, StoryObj } from '@storybook/vue3';
import FullTimestamp from '@/components/primitives/FullTimestamp.vue';

const meta = {
  title: '02-Primitives/FullTimestamp',
  component: FullTimestamp,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof FullTimestamp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { datetime: new Date(Date.now() - 3600000).toISOString() },
};

export const OldDate: Story = {
  args: { datetime: '2023-06-15T14:30:00.000Z' },
};
