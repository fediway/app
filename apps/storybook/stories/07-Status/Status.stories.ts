import type { Meta, StoryObj } from '@storybook/vue3';
import { Status } from '@/components/status';
import { createMockAccount, createMockStatus } from '../../mocks';
import { wideDecorator } from '../decorators';

const meta = {
  title: '07-Status/Status',
  component: Status,
  tags: ['autodocs'],
  decorators: [wideDecorator],
} satisfies Meta<typeof Status>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { status: createMockStatus() },
};

export const LongContent: Story = {
  args: {
    status: createMockStatus({
      content: `<p>${'This is a long post that demonstrates how the status component handles multi-paragraph content. '.repeat(5)}</p>`,
    }),
  },
};

export const WithSpoiler: Story = {
  args: {
    status: createMockStatus({
      spoilerText: 'Content warning: spoiler for the latest episode',
      content: '<p>I can\'t believe the main character actually survived that.</p>',
    }),
  },
};

export const Reblog: Story = {
  args: {
    status: createMockStatus({
      reblog: createMockStatus({
        account: createMockAccount({ displayName: 'Original Author', username: 'original' }),
        content: '<p>This is the original post that was reposted.</p>',
      }),
      content: '',
    }),
  },
};

export const Favourited: Story = {
  args: {
    status: createMockStatus({
      favourited: true,
      reblogged: true,
      bookmarked: true,
      favouritesCount: 42,
      reblogsCount: 15,
    }),
  },
};

export const DirectMessage: Story = {
  args: {
    status: createMockStatus({
      visibility: 'direct',
      content: '<p>This is a private direct message.</p>',
    }),
  },
};

export const ZeroCounts: Story = {
  args: {
    status: createMockStatus({
      repliesCount: 0,
      reblogsCount: 0,
      favouritesCount: 0,
    }),
  },
};

export const ReplyThread: Story = {
  render: () => ({
    components: { Status },
    setup() {
      const parent = createMockStatus({
        account: createMockAccount({ displayName: 'Sarah Chen', username: 'sarah' }),
        content: '<p>What do you think about the new Vue 3.5 features?</p>',
      });
      const reply = createMockStatus({
        content: '<p>The reactivity improvements are incredible. Especially the new watch behavior.</p>',
        replyParent: parent,
      });
      return { reply, parent };
    },
    template: `
      <div style="max-width: 600px">
        <Status :status="reply" :reply-parent="parent" />
      </div>
    `,
  }),
};

export const WithReplyBelow: Story = {
  args: {
    status: createMockStatus({
      content: '<p>Starting a new thread about component architecture...</p>',
    }),
    hasReplyBelow: true,
    showSeparator: false,
  },
};

export const WithReplyAbove: Story = {
  args: {
    status: createMockStatus({
      content: '<p>This is the last reply in a chain. It has a connector line above linking to the previous post.</p>',
    }),
    hasReplyAbove: true,
  },
};

export const MiddleOfChain: Story = {
  render: () => ({
    components: { Status },
    setup() {
      const first = createMockStatus({
        account: createMockAccount({ displayName: 'Sarah Chen', username: 'sarah' }),
        content: '<p>First post in the chain — has a line below.</p>',
      });
      const middle = createMockStatus({
        account: createMockAccount({ displayName: 'Alex Kim', username: 'alex' }),
        content: '<p>Middle post — connected above AND below. This is the trickiest visual case for thread connectors.</p>',
      });
      const last = createMockStatus({
        account: createMockAccount({ displayName: 'Jordan Lee', username: 'jordan' }),
        content: '<p>Last post in the chain — only connected above.</p>',
      });
      return { first, middle, last };
    },
    template: `
      <div style="max-width: 600px">
        <Status :status="first" :has-reply-below="true" :show-separator="false" />
        <Status :status="middle" :has-reply-above="true" :has-reply-below="true" :show-separator="false" />
        <Status :status="last" :has-reply-above="true" />
      </div>
    `,
  }),
};

export const HideActions: Story = {
  args: {
    status: createMockStatus({
      content: '<p>This status has its action bar hidden (used for ancestor posts in threads).</p>',
    }),
    hideActions: true,
  },
};
