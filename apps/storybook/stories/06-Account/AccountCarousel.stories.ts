import type { Meta, StoryObj } from '@storybook/vue3';
import AccountCarousel from '@/components/account/AccountCarousel.vue';
import { createMockAccount } from '../../mocks';

const meta = {
  title: '06-Account/AccountCarousel',
  component: AccountCarousel,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 420px"><story /></div>' })],
} satisfies Meta<typeof AccountCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    accounts: [
      createMockAccount({ displayName: 'Alice Chen', username: 'alice', followersCount: 1234 }),
      createMockAccount({ displayName: 'Sarah Chen', username: 'sarah', followersCount: 5678 }),
      createMockAccount({ displayName: 'Alex Rivera', username: 'alex', followersCount: 890 }),
      createMockAccount({ displayName: 'Jordan Kim', username: 'jordan', followersCount: 2345 }),
      createMockAccount({ displayName: 'Morgan Lee', username: 'morgan', followersCount: 432 }),
    ],
  },
};

export const FewAccounts: Story = {
  args: {
    accounts: [
      createMockAccount({ displayName: 'Alice Chen', username: 'alice', followersCount: 1234 }),
      createMockAccount({ displayName: 'Sarah Chen', username: 'sarah', followersCount: 5678 }),
    ],
  },
};
