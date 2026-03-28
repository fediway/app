import type { Meta, StoryObj } from '@storybook/vue3';
import { AccountCard } from '@/components/account';
import { createMockAccount } from '../../mocks';
import { wideDecorator } from '../decorators';

const meta = {
  title: '06-Account/AccountCard',
  component: AccountCard,
  tags: ['autodocs'],
  decorators: [wideDecorator],
} satisfies Meta<typeof AccountCard>;

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
      note: '<p>Photographer & nature lover. Capturing moments one click at a time.</p>',
    }),
    showBio: true,
  },
};

export const SmallSize: Story = {
  args: {
    account: createMockAccount({ displayName: 'Alex Rivera', username: 'alex' }),
    size: 'sm',
  },
};
