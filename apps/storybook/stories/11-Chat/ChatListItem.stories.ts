import type { Meta, StoryObj } from '@storybook/vue3';
import ChatListItem from '@/components/chat/ChatListItem.vue';

const meta = {
  title: '11-Chat/ChatListItem',
  component: ChatListItem,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof ChatListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    conversation: {
      id: '1',
      accounts: [{
        id: '1',
        username: 'sarah',
        acct: 'sarah@mastodon.social',
        displayName: 'Sarah Chen',
        avatar: 'https://picsum.photos/seed/sarah/200/200',
        avatarStatic: 'https://picsum.photos/seed/sarah/200/200',
        header: '',
        headerStatic: '',
        note: '',
        url: '',
        locked: false,
        bot: false,
        group: false,
        createdAt: '',
        lastStatusAt: '',
        statusesCount: 0,
        followersCount: 0,
        followingCount: 0,
        emojis: [],
        fields: [],
        roles: [],
      }],
      unread: false,
      lastStatus: {
        id: '1',
        uri: '',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        editedAt: null,
        content: '<p>Sounds great, see you tomorrow!</p>',
        visibility: 'direct',
        sensitive: false,
        spoilerText: '',
        mediaAttachments: [],
        mentions: [],
        tags: [],
        emojis: [],
        reblogsCount: 0,
        favouritesCount: 0,
        repliesCount: 0,
        account: {} as any,
        application: { name: '', website: null },
        reblog: null,
        poll: null,
        card: null,
        quote: null,
        quotesCount: 0,
        quoteApproval: { state: 'pending' },
        filtered: [],
      },
    },
  },
};

export const Unread: Story = {
  args: {
    ...Default.args,
    conversation: {
      ...Default.args!.conversation,
      unread: true,
    },
  },
};
