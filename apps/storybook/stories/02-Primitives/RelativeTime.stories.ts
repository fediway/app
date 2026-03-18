import type { Meta, StoryObj } from '@storybook/vue3';
import { RelativeTime } from '@/components/primitives';

const meta = {
  title: '02-Primitives/RelativeTime',
  component: RelativeTime,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof RelativeTime>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { datetime: new Date(Date.now() - 3600000).toISOString() },
};

export const Recent: Story = {
  args: { datetime: new Date(Date.now() - 120000).toISOString() },
};

export const Old: Story = {
  args: { datetime: new Date(Date.now() - 30 * 86400000).toISOString() },
};
