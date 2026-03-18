import type { Meta, StoryObj } from '@storybook/vue3';
import { AccountActions } from '@/components/account';

const meta = {
  title: '6-Account/AccountActions',
  component: AccountActions,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof AccountActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { relationship: null },
};

export const OwnProfile: Story = {
  args: { isOwnProfile: true },
};
