import type { Meta, StoryObj } from '@storybook/vue3';
import { AccountHandle } from '@/components/account';

const meta = {
  title: '06-Account/AccountHandle',
  component: AccountHandle,
  tags: ['autodocs'],
} satisfies Meta<typeof AccountHandle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { acct: 'alice@mastodon.social' },
};

export const WithInstance: Story = {
  args: { acct: 'alice@a-very-long-instance-domain.example.com', showInstance: true },
};

export const LocalUser: Story = {
  args: { acct: 'alice' },
};
