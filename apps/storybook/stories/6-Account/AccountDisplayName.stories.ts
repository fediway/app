import type { Meta, StoryObj } from '@storybook/vue3';
import { AccountDisplayName } from '@/components/account';

const meta = {
  title: '6-Account/AccountDisplayName',
  component: AccountDisplayName,
  tags: ['autodocs'],
} satisfies Meta<typeof AccountDisplayName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { name: 'Alice Chen' },
};

export const AsLink: Story = {
  args: { name: 'Alice Chen', asLink: true, href: '#' },
};

export const LongName: Story = {
  args: { name: 'A Very Long Display Name That Should Truncate Somewhere In The UI Component' },
};

export const Empty: Story = {
  args: { name: '' },
};
