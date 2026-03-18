import type { Meta, StoryObj } from '@storybook/vue3';
import { AccountStats } from '@/components/account';

const meta = {
  title: '6-Account/AccountStats',
  component: AccountStats,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof AccountStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { statusesCount: 890, followersCount: 1234, followingCount: 567 },
};

export const HighNumbers: Story = {
  args: { statusesCount: 45000, followersCount: 1500000, followingCount: 200 },
};

export const Zero: Story = {
  args: { statusesCount: 0, followersCount: 0, followingCount: 0 },
};
