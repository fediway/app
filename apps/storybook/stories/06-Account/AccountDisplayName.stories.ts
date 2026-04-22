import type { Meta, StoryObj } from '@storybook/vue3';
import { AccountDisplayName } from '@/components/account';

const meta = {
  title: '06-Account/AccountDisplayName',
  component: AccountDisplayName,
  tags: ['autodocs'],
} satisfies Meta<typeof AccountDisplayName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { name: 'Alice Chen' },
};

export const WithEmojis: Story = {
  args: {
    name: 'Alice :sparkles: Chen',
    emojis: [
      {
        shortcode: 'sparkles',
        url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2728.png',
        staticUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2728.png',
        visibleInPicker: true,
      },
    ],
  },
};

export const UnresolvedEmojiStripped: Story = {
  args: { name: 'Alice :missing: Chen' },
};

export const LongName: Story = {
  args: { name: 'A Very Long Display Name That Should Truncate Somewhere In The UI Component' },
};

export const Empty: Story = {
  args: { name: '' },
};
