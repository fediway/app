import type { Meta, StoryObj } from '@storybook/vue3';
import ChatHeader from '@/components/chat/ChatHeader.vue';

const meta = {
  title: '11-Chat/ChatHeader',
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

export const LongDisplayName: Story = {
  args: {
    participant: {
      avatar: 'https://picsum.photos/seed/longname/200/200',
      displayName: 'Alexandria Victoria Penelope Worthington-Smythe III',
      acct: 'alexandria@a-very-long-mastodon-instance-name.example.org',
    },
  },
};

export const NoAvatar: Story = {
  args: {
    participant: {
      avatar: '',
      displayName: 'Ghost User',
      acct: 'ghost@mastodon.social',
    },
  },
};

export const ShortName: Story = {
  args: {
    participant: {
      avatar: 'https://picsum.photos/seed/al/200/200',
      displayName: 'Al',
      acct: 'al',
    },
  },
};
