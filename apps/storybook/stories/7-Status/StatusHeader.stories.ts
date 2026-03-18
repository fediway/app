import type { Meta, StoryObj } from '@storybook/vue3';
import { StatusHeader } from '@/components/status';
import { createMockAccount } from '../../mocks';

const meta = {
  title: '7-Status/StatusHeader',
  component: StatusHeader,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof StatusHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    account: createMockAccount({ displayName: 'Alice Chen', username: 'alice' }),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
};

export const Compact: Story = {
  args: {
    account: createMockAccount({ displayName: 'Alice Chen', username: 'alice' }),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    compact: true,
  },
};
