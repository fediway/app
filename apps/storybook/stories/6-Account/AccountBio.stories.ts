import type { Meta, StoryObj } from '@storybook/vue3';
import { AccountBio } from '@/components/account';
import { createMockAccount } from '../../mocks';

const meta = {
  title: '6-Account/AccountBio',
  component: AccountBio,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof AccountBio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    account: createMockAccount({
      displayName: 'Alice Chen',
      username: 'alice',
      note: '<p>Software developer & open source enthusiast. Building on the fediverse. Previously at Stripe.</p>',
    }),
  },
};

export const WithFields: Story = {
  args: {
    account: createMockAccount({
      displayName: 'Alice Chen',
      username: 'alice',
      note: '<p>Developer & designer</p>',
      fields: [
        { name: 'Website', value: '<a href="https://alice.dev">alice.dev</a>', verifiedAt: '2024-01-15T00:00:00.000Z' },
        { name: 'Location', value: 'San Francisco, CA' },
        { name: 'Pronouns', value: 'she/her' },
      ],
    }),
  },
};

export const EmptyBio: Story = {
  args: {
    account: createMockAccount({ note: '' }),
  },
};

export const LongBio: Story = {
  args: {
    account: createMockAccount({
      note: `<p>${'This is a very detailed bio about my interests and work. '.repeat(10)}</p>`,
    }),
  },
};
