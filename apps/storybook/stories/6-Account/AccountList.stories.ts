import type { Meta, StoryObj } from '@storybook/vue3';
import { AccountList } from '@/components/account';
import { createMockAccount } from '../../mocks';

const meta = {
  title: '6-Account/AccountList',
  component: AccountList,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof AccountList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    accounts: [
      createMockAccount({ displayName: 'Alice Chen', username: 'alice' }),
      createMockAccount({ displayName: 'Sarah Chen', username: 'sarah' }),
      createMockAccount({ displayName: 'Alex Rivera', username: 'alex' }),
      createMockAccount({ displayName: 'Jordan Kim', username: 'jordan' }),
      createMockAccount({ displayName: 'Morgan Lee', username: 'morgan' }),
    ],
    showBio: true,
  },
};

export const Loading: Story = {
  args: { accounts: [], loading: true },
};

export const Empty: Story = {
  args: { accounts: [] },
};
