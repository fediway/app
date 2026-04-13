import type { Meta, StoryObj } from '@storybook/vue3';
import { Status } from '@/components/status';
import { createMockAccount, createMockStatus } from '../../mocks';
import { wideDecorator } from '../decorators';

const meta = {
  title: '07-Status/Status',
  component: Status,
  tags: ['autodocs'],
  decorators: [wideDecorator],
  parameters: {
    docs: {
      description: {
        component:
          'The canonical status row. Layout and thread rails are driven by '
          + 'the `threadPosition` discriminated union — never hand-author this '
          + 'prop; derive it from `shapeThreadContext()` or `shapeFeedStatus()`.',
      },
    },
  },
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

export const ReblogOfReply: Story = {
  name: 'Reblog of a reply (A7)',
  parameters: {
    docs: {
      description: {
        story:
          'Edge case from the feed scenario matrix: someone reblogs a post that '
          + 'is itself a reply. The reblog indicator sits above, then the original '
          + 'reply renders with its parent context preview — so the reader sees '
          + 'both who reposted it AND what it was replying to.',
      },
    },
  },
  render: () => ({
    components: { Status },
    setup() {
      const parent = createMockStatus({
        id: 'parent',
        account: createMockAccount({ displayName: 'Sarah Chen', username: 'sarah' }),
        content: '<p>Anyone else feel like CSS Grid finally clicked for them in 2024?</p>',
      });
      const reply = createMockStatus({
        id: 'reply',
        account: createMockAccount({ displayName: 'Alex Kim', username: 'alex' }),
        content: '<p>Yes — once I stopped fighting it and embraced subgrid, everything got easier.</p>',
        inReplyToId: 'parent',
        favouritesCount: 32,
        reblogsCount: 8,
      });
      const reblog = createMockStatus({
        id: 'reblog-wrapper',
        account: createMockAccount({ displayName: 'Jordan Lee', username: 'jordan' }),
        reblog: reply,
      });
      return {
        reblog,
        position: { kind: 'reply-with-parent-preview', parent },
      };
    },
    template: `
      <div style="max-width: 600px">
        <Status :status="reblog" :thread-position="position" />
      </div>
    `,
  }),
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

export const HideActions: Story = {
  args: {
    status: createMockStatus({
      content: '<p>This status has its action bar hidden (used for ancestor posts in threads).</p>',
    }),
    hideActions: true,
  },
};

export const AuthorReply: Story = {
  name: 'OP "Author" badge',
  args: {
    status: createMockStatus({
      content: '<p>A reply by the same author as the focused post — gets a small "Author" pill in the header so readers can spot OP\'s contributions in a long thread.</p>',
    }),
    isAuthorReply: true,
  },
};

// ---------------------------------------------------------------------------
// Thread position variants
// ---------------------------------------------------------------------------

export const Position_Standalone: Story = {
  name: 'threadPosition: standalone',
  args: {
    status: createMockStatus({
      content: '<p>A standalone post — no thread connections.</p>',
    }),
    threadPosition: { kind: 'standalone' },
  },
};

export const Position_ChainStart: Story = {
  name: 'threadPosition: chain-start',
  args: {
    status: createMockStatus({
      content: '<p>First post in a chain — rail extends below only.</p>',
    }),
    threadPosition: { kind: 'chain-start' },
    showSeparator: false,
  },
};

export const Position_ChainMiddle: Story = {
  name: 'threadPosition: chain-middle',
  args: {
    status: createMockStatus({
      content: '<p>Middle of a chain — rail extends above AND below.</p>',
    }),
    threadPosition: { kind: 'chain-middle' },
    showSeparator: false,
  },
};

export const Position_ChainEnd: Story = {
  name: 'threadPosition: chain-end',
  args: {
    status: createMockStatus({
      content: '<p>End of a chain — rail extends above only.</p>',
    }),
    threadPosition: { kind: 'chain-end' },
  },
};

export const Position_ReplyWithParentPreview: Story = {
  name: 'threadPosition: reply-with-parent-preview',
  parameters: {
    docs: {
      description: {
        story:
          'Feed context pattern — shows the parent status as a compact preview '
          + 'above the main status, with a rail running from parent avatar down '
          + 'to main avatar. Used when a reply appears in a feed and we want to '
          + 'provide conversation context.',
      },
    },
  },
  render: () => ({
    components: { Status },
    setup() {
      const parent = createMockStatus({
        id: 'parent',
        account: createMockAccount({ displayName: 'Sarah Chen', username: 'sarah' }),
        content: '<p>What do you think about the new Vue 3.5 features?</p>',
      });
      const reply = createMockStatus({
        content: '<p>The reactivity improvements are incredible. Especially the new watch behavior.</p>',
        inReplyToId: 'parent',
      });
      return { reply, position: { kind: 'reply-with-parent-preview', parent } };
    },
    template: `
      <div style="max-width: 600px">
        <Status :status="reply" :thread-position="position" />
      </div>
    `,
  }),
};

export const ChainOfThree: Story = {
  name: 'Three-post chain (continuity test)',
  parameters: {
    docs: {
      description: {
        story:
          'Verifies rail continuity across the three non-standalone states: '
          + 'chain-start → chain-middle → chain-end. The rail should be an '
          + 'uninterrupted line from the first avatar to the last.',
      },
    },
  },
  render: () => ({
    components: { Status },
    setup() {
      const first = createMockStatus({
        id: '1',
        account: createMockAccount({ displayName: 'Sarah Chen', username: 'sarah' }),
        content: '<p>First post in the chain.</p>',
      });
      const middle = createMockStatus({
        id: '2',
        account: createMockAccount({ displayName: 'Alex Kim', username: 'alex' }),
        content: '<p>Middle post — connected above AND below.</p>',
      });
      const last = createMockStatus({
        id: '3',
        account: createMockAccount({ displayName: 'Jordan Lee', username: 'jordan' }),
        content: '<p>Last post in the chain.</p>',
      });
      return { first, middle, last };
    },
    template: `
      <div style="max-width: 600px">
        <Status :status="first" :thread-position="{ kind: 'chain-start' }" :show-separator="false" />
        <Status :status="middle" :thread-position="{ kind: 'chain-middle' }" :show-separator="false" />
        <Status :status="last" :thread-position="{ kind: 'chain-end' }" />
      </div>
    `,
  }),
};
