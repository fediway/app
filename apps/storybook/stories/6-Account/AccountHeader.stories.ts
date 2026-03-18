import type { Meta, StoryObj } from '@storybook/vue3';
import { AccountHeader } from '@/components/account';
import { createMockAccount } from '../../mocks';

const meta = {
  title: '6-Account/AccountHeader',
  component: AccountHeader,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
  argTypes: {
    followsYou: { control: 'boolean' },
    showBack: { control: 'boolean' },
  },
} satisfies Meta<typeof AccountHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    account: createMockAccount({
      displayName: 'Alice Chen',
      username: 'alice',
    }),
  },
};

export const NoHeaderImage: Story = {
  args: {
    account: createMockAccount({
      displayName: 'Alice Chen',
      username: 'alice',
      header: '',
      headerStatic: '',
    }),
  },
};

export const NoAvatar: Story = {
  args: {
    account: createMockAccount({
      displayName: 'Alice Chen',
      username: 'alice',
      avatar: '',
      avatarStatic: '',
    }),
  },
};

export const FollowsYou: Story = {
  args: {
    account: createMockAccount({ displayName: 'Sarah Chen', username: 'sarah' }),
    followsYou: true,
  },
  render: args => ({
    components: { AccountHeader },
    setup: () => ({ args }),
    template: `
      <AccountHeader v-bind="args">
        <template #badge>
          <span class="absolute right-4 bottom-0 translate-y-full mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            Follows you
          </span>
        </template>
      </AccountHeader>
    `,
  }),
};

export const WithoutBackButton: Story = {
  args: {
    account: createMockAccount({ displayName: 'Alice Chen', username: 'alice' }),
    showBack: false,
  },
};
