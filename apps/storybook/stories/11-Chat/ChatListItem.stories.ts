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

const participant = {
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
};

const baseStatus = {
  id: '1',
  uri: '',
  createdAt: new Date(Date.now() - 3600000).toISOString(),
  editedAt: null,
  visibility: 'direct' as const,
  sensitive: false,
  spoilerText: '',
  mediaAttachments: [],
  mentions: [],
  tags: [],
  emojis: [],
  reblogsCount: 0,
  favouritesCount: 0,
  repliesCount: 0,
  application: { name: '', website: null },
  reblog: null,
  poll: null,
  card: null,
  quote: null,
  quotesCount: 0,
  quoteApproval: { state: 'pending' as const },
  filtered: [],
};

/** They sent the last message — read */
export const TheirMessageRead: Story = {
  args: {
    conversation: {
      id: '1',
      accounts: [participant],
      unread: false,
      lastStatus: {
        ...baseStatus,
        content: '<p>Sounds great, see you tomorrow!</p>',
        account: participant,
      },
    },
  },
};

/** They sent the last message — unread (you need to act) */
export const TheirMessageUnread: Story = {
  args: {
    conversation: {
      id: '2',
      accounts: [participant],
      unread: true,
      lastStatus: {
        ...baseStatus,
        content: '<p>Hey, have you read that new book by Susanna Clarke?</p>',
        account: participant,
      },
    },
  },
};

/** You sent the last message — read (waiting for reply) */
export const YourMessageRead: Story = {
  args: {
    conversation: {
      id: '3',
      accounts: [participant],
      unread: false,
      lastStatus: {
        ...baseStatus,
        content: '<p>Yes I loved it! The atmosphere is incredible.</p>',
        account: { ...participant, id: '99', acct: 'me@fediway.social' },
      },
    },
  },
};

/** You sent the last message — unread (rare, they haven't seen it) */
export const YourMessageUnread: Story = {
  args: {
    conversation: {
      id: '4',
      accounts: [participant],
      unread: true,
      lastStatus: {
        ...baseStatus,
        content: '<p>Just sent you the link!</p>',
        account: { ...participant, id: '99', acct: 'me@fediway.social' },
      },
    },
  },
};

const alex = {
  ...participant,
  id: '2',
  username: 'alex',
  acct: 'alex@mastodon.social',
  displayName: 'Alex Rivera',
  avatar: 'https://picsum.photos/seed/alex/200/200',
  avatarStatic: 'https://picsum.photos/seed/alex/200/200',
};

const maria = {
  ...participant,
  id: '3',
  username: 'maria',
  acct: 'maria@mastodon.social',
  displayName: 'Maria Santos',
  avatar: 'https://picsum.photos/seed/maria/200/200',
  avatarStatic: 'https://picsum.photos/seed/maria/200/200',
};

const james = {
  ...participant,
  id: '4',
  username: 'james',
  acct: 'james@mastodon.social',
  displayName: 'James Park',
  avatar: 'https://picsum.photos/seed/james/200/200',
  avatarStatic: 'https://picsum.photos/seed/james/200/200',
};

/** Group chat — someone else sent last message, unread */
export const GroupUnread: Story = {
  args: {
    conversation: {
      id: '10',
      accounts: [participant, alex, maria],
      unread: true,
      lastStatus: {
        ...baseStatus,
        content: '<p>What time works for everyone?</p>',
        account: alex,
      },
    },
  },
};

/** Group chat — someone else sent last message, read */
export const GroupRead: Story = {
  args: {
    conversation: {
      id: '11',
      accounts: [participant, alex, maria],
      unread: false,
      lastStatus: {
        ...baseStatus,
        content: '<p>See you all at 7!</p>',
        account: maria,
      },
    },
  },
};

/** Group chat — you sent last message */
export const GroupYourMessage: Story = {
  args: {
    conversation: {
      id: '12',
      accounts: [participant, alex, maria],
      unread: false,
      lastStatus: {
        ...baseStatus,
        content: '<p>I\'ll bring the books!</p>',
        account: { ...participant, id: '99', acct: 'me@fediway.social' },
      },
    },
  },
};

/** Group chat — 4+ participants (shows +N) */
export const GroupLarge: Story = {
  args: {
    conversation: {
      id: '13',
      accounts: [participant, alex, maria, james],
      unread: true,
      lastStatus: {
        ...baseStatus,
        content: '<p>Has anyone read the new Piranesi sequel?</p>',
        account: james,
      },
    },
  },
};

/** All variants side by side */
export const AllVariants: Story = {
  render: () => ({
    components: { ChatListItem },
    setup() {
      const theirUnread = {
        id: '1',
        accounts: [participant],
        unread: true,
        lastStatus: { ...baseStatus, content: '<p>Have you seen this?</p>', account: participant },
      };
      const theirRead = {
        id: '2',
        accounts: [participant],
        unread: false,
        lastStatus: { ...baseStatus, content: '<p>Sounds great, see you tomorrow!</p>', account: participant },
      };
      const yourRead = {
        id: '3',
        accounts: [participant],
        unread: false,
        lastStatus: { ...baseStatus, content: '<p>Yes I loved it!</p>', account: { ...participant, id: '99', acct: 'me@fediway.social' } },
      };
      const yourUnread = {
        id: '4',
        accounts: [participant],
        unread: true,
        lastStatus: { ...baseStatus, content: '<p>Just sent the link!</p>', account: { ...participant, id: '99', acct: 'me@fediway.social' } },
      };
      const groupUnread = {
        id: '5',
        accounts: [participant, alex, maria],
        unread: true,
        lastStatus: { ...baseStatus, content: '<p>What time works?</p>', account: alex },
      };
      const groupRead = {
        id: '6',
        accounts: [participant, alex, maria],
        unread: false,
        lastStatus: { ...baseStatus, content: '<p>See you at 7!</p>', account: maria },
      };
      const groupYours = {
        id: '7',
        accounts: [participant, alex, maria],
        unread: false,
        lastStatus: { ...baseStatus, content: '<p>I\'ll bring the books!</p>', account: { ...participant, id: '99', acct: 'me@fediway.social' } },
      };
      const groupLarge = {
        id: '8',
        accounts: [participant, alex, maria, james],
        unread: true,
        lastStatus: { ...baseStatus, content: '<p>Has anyone read the sequel?</p>', account: james },
      };
      return { theirUnread, theirRead, yourRead, yourUnread, groupUnread, groupRead, groupYours, groupLarge };
    },
    template: `
      <div class="divide-y divide-border">
        <div class="text-[10px] font-mono text-muted-foreground px-4 py-1">DM — their message, unread</div>
        <ChatListItem :conversation="theirUnread" />
        <div class="text-[10px] font-mono text-muted-foreground px-4 py-1 mt-2">DM — their message, read</div>
        <ChatListItem :conversation="theirRead" />
        <div class="text-[10px] font-mono text-muted-foreground px-4 py-1 mt-2">DM — your message, read</div>
        <ChatListItem :conversation="yourRead" />
        <div class="text-[10px] font-mono text-muted-foreground px-4 py-1 mt-2">DM — your message, unread</div>
        <ChatListItem :conversation="yourUnread" />
        <div class="text-[10px] font-mono text-muted-foreground px-4 py-1 mt-4 border-t border-border pt-3">Group — unread (action needed)</div>
        <ChatListItem :conversation="groupUnread" />
        <div class="text-[10px] font-mono text-muted-foreground px-4 py-1 mt-2">Group — read</div>
        <ChatListItem :conversation="groupRead" />
        <div class="text-[10px] font-mono text-muted-foreground px-4 py-1 mt-2">Group — your message</div>
        <ChatListItem :conversation="groupYours" />
        <div class="text-[10px] font-mono text-muted-foreground px-4 py-1 mt-2">Group — 4+ people, unread</div>
        <ChatListItem :conversation="groupLarge" />
      </div>
    `,
  }),
};
