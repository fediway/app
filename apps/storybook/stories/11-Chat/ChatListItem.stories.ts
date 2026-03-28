import type { Meta, StoryObj } from '@storybook/vue3';
import ChatListItem from '@/components/chat/ChatListItem.vue';
import { createMockAccount, createMockStatus } from '../../mocks';

const meta = {
  title: '11-Chat/ChatListItem',
  component: ChatListItem,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof ChatListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const participant = createMockAccount({
  id: '1',
  username: 'sarah',
  displayName: 'Sarah Chen',
});

/** They sent the last message — read */
export const TheirMessageRead: Story = {
  args: {
    conversation: {
      id: '1',
      accounts: [participant],
      unread: false,
      lastStatus: createMockStatus({
        content: '<p>Sounds great, see you tomorrow!</p>',
        account: participant,
        visibility: 'direct',
      }),
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
      lastStatus: createMockStatus({
        content: '<p>Hey, have you read that new book by Susanna Clarke?</p>',
        account: participant,
        visibility: 'direct',
      }),
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
      lastStatus: createMockStatus({
        content: '<p>Yes I loved it! The atmosphere is incredible.</p>',
        account: createMockAccount({ id: '99', acct: 'me@fediway.social' }),
        visibility: 'direct',
      }),
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
      lastStatus: createMockStatus({
        content: '<p>Just sent you the link!</p>',
        account: createMockAccount({ id: '99', acct: 'me@fediway.social' }),
        visibility: 'direct',
      }),
    },
  },
};

const alex = createMockAccount({
  id: '2',
  username: 'alex',
  displayName: 'Alex Rivera',
});

const maria = createMockAccount({
  id: '3',
  username: 'maria',
  displayName: 'Maria Santos',
});

const james = createMockAccount({
  id: '4',
  username: 'james',
  displayName: 'James Park',
});

const me = createMockAccount({ id: '99', acct: 'me@fediway.social' });

/** Group chat — someone else sent last message, unread */
export const GroupUnread: Story = {
  args: {
    conversation: {
      id: '10',
      accounts: [participant, alex, maria],
      unread: true,
      lastStatus: createMockStatus({
        content: '<p>What time works for everyone?</p>',
        account: alex,
        visibility: 'direct',
      }),
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
      lastStatus: createMockStatus({
        content: '<p>See you all at 7!</p>',
        account: maria,
        visibility: 'direct',
      }),
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
      lastStatus: createMockStatus({
        content: '<p>I\'ll bring the books!</p>',
        account: me,
        visibility: 'direct',
      }),
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
      lastStatus: createMockStatus({
        content: '<p>Has anyone read the new Piranesi sequel?</p>',
        account: james,
        visibility: 'direct',
      }),
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
        lastStatus: createMockStatus({ content: '<p>Have you seen this?</p>', account: participant, visibility: 'direct' as const }),
      };
      const theirRead = {
        id: '2',
        accounts: [participant],
        unread: false,
        lastStatus: createMockStatus({ content: '<p>Sounds great, see you tomorrow!</p>', account: participant, visibility: 'direct' as const }),
      };
      const yourRead = {
        id: '3',
        accounts: [participant],
        unread: false,
        lastStatus: createMockStatus({ content: '<p>Yes I loved it!</p>', account: me, visibility: 'direct' as const }),
      };
      const yourUnread = {
        id: '4',
        accounts: [participant],
        unread: true,
        lastStatus: createMockStatus({ content: '<p>Just sent the link!</p>', account: me, visibility: 'direct' as const }),
      };
      const groupUnread = {
        id: '5',
        accounts: [participant, alex, maria],
        unread: true,
        lastStatus: createMockStatus({ content: '<p>What time works?</p>', account: alex, visibility: 'direct' as const }),
      };
      const groupRead = {
        id: '6',
        accounts: [participant, alex, maria],
        unread: false,
        lastStatus: createMockStatus({ content: '<p>See you at 7!</p>', account: maria, visibility: 'direct' as const }),
      };
      const groupYours = {
        id: '7',
        accounts: [participant, alex, maria],
        unread: false,
        lastStatus: createMockStatus({ content: '<p>I\'ll bring the books!</p>', account: me, visibility: 'direct' as const }),
      };
      const groupLarge = {
        id: '8',
        accounts: [participant, alex, maria, james],
        unread: true,
        lastStatus: createMockStatus({ content: '<p>Has anyone read the sequel?</p>', account: james, visibility: 'direct' as const }),
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
