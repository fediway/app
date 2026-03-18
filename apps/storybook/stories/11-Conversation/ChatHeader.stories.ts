import type { Meta, StoryObj } from '@storybook/vue3';
import ChatHeader from '@/components/conversation/ChatHeader.vue';

const meta = {
  title: '11-Conversation/ChatHeader',
  component: ChatHeader,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof ChatHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    participant: {
      avatar: 'https://picsum.photos/seed/sarah/200/200',
      displayName: 'Sarah Chen',
      acct: 'sarah@mastodon.social',
    },
  },
};
