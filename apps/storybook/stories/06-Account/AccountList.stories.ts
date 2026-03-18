import type { Meta, StoryObj } from '@storybook/vue3';
import { AccountList, FollowButton } from '@/components/account';
import { createMockAccount } from '../../mocks';

const fiveAccounts = [
  createMockAccount({ displayName: 'Alice Chen', username: 'alice' }),
  createMockAccount({ displayName: 'Sarah Chen', username: 'sarah' }),
  createMockAccount({ displayName: 'Alex Rivera', username: 'alex' }),
  createMockAccount({ displayName: 'Jordan Kim', username: 'jordan' }),
  createMockAccount({ displayName: 'Morgan Lee', username: 'morgan' }),
];

const meta = {
  title: '06-Account/AccountList',
  component: AccountList,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof AccountList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { accounts: fiveAccounts, showBio: true },
};

export const WithFollowButtons: Story = {
  render: () => ({
    components: { AccountList, FollowButton },
    setup() {
      return { accounts: fiveAccounts };
    },
    template: `
      <AccountList :accounts="accounts" show-bio>
        <template #item-action="{ account }">
          <FollowButton :is-following="false" />
        </template>
      </AccountList>
    `,
  }),
};

export const CompactWithLimit: Story = {
  args: { accounts: fiveAccounts, limit: 3, showSeeMore: true },
};

export const Loading: Story = {
  args: { accounts: [], loading: true },
};

export const Empty: Story = {
  args: { accounts: [] },
};

export const Error: Story = {
  args: { accounts: [], error: 'Failed to load accounts' },
};
