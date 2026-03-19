import type { Meta, StoryObj } from '@storybook/vue3';
import { Status } from '@/components/status';
import { createMockAccount, createMockStatus } from '../../mocks';

const meta = {
  title: '07-Status/Status',
  component: Status,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
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
        content: '<p>This is the original post that was boosted.</p>',
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

export const HideActions: Story = {
  args: {
    status: createMockStatus({
      content: '<p>This status has its action bar hidden (used for ancestor posts in threads).</p>',
    }),
    hideActions: true,
  },
};
