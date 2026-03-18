import type { Meta, StoryObj } from '@storybook/vue3';
import AccountListItem from '@/components/account/AccountListItem.vue';
import { createMockAccount } from '../../mocks';

const meta = {
  title: '6-Account/AccountListItem',
  component: AccountListItem,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof AccountListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { account: createMockAccount({ displayName: 'Alice Chen', username: 'alice' }) },
};

export const WithBio: Story = {
  args: {
    account: createMockAccount({
      displayName: 'Sarah Chen',
      username: 'sarah',
      note: '<p>Photographer & nature lover. Capturing moments one click at a time. Based in San Francisco.</p>',
    }),
    showBio: true,
  },
};

export const WithStats: Story = {
  args: {
    account: createMockAccount({ displayName: 'Alex Rivera', username: 'alex', followersCount: 15000, followingCount: 320 }),
    showStats: true,
  },
};

export const SmallSize: Story = {
  args: {
    account: createMockAccount({ displayName: 'Jordan Kim', username: 'jordan' }),
    size: 'sm',
  },
};
