import type { Meta, StoryObj } from '@storybook/vue3';
import { defineComponent } from 'vue';
import { QuickReply, Status, StatusAncestor, StatusDetailMain } from '@/components/status';
import { createMockAccount, createMockStatus } from '../../mocks';

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------

const alice = createMockAccount({ id: '1', displayName: 'Alice Chen', username: 'alice' });
const sarah = createMockAccount({ id: '2', displayName: 'Sarah Rivera', username: 'sarah' });
const alex = createMockAccount({ id: '3', displayName: 'Alex Kim', username: 'alex' });
const jordan = createMockAccount({ id: '4', displayName: 'Jordan Lee', username: 'jordan' });
const maya = createMockAccount({ id: '5', displayName: 'Maya Patel', username: 'maya' });

// ---------------------------------------------------------------------------
// Story wrapper — reproduces the exact thread page layout from
// apps/web/app/pages/@[acct]/[id]/index.vue
// ---------------------------------------------------------------------------

const ThreadLayout = defineComponent({
  name: 'ThreadLayout',
  components: { StatusAncestor, StatusDetailMain, Status, QuickReply },
  props: {
    ancestors: { type: Array, default: () => [] },
    main: { type: Object, required: true },
    descendants: { type: Array, default: () => [] },
    showQuickReply: { type: Boolean, default: false },
  },
  setup(props) {
    // Reproduce the exact hasReplyAbove / hasReplyBelow / getReplyParent
    // logic from the thread detail page
    function hasReplyAbove(reply: any, index: number): boolean {
      if (!reply.inReplyToId)
        return false;
      if (reply.inReplyToId === props.main.id)
        return false;
      if (index > 0) {
        const prev = (props.descendants as any[])[index - 1];
        if (prev && prev.id === reply.inReplyToId)
          return true;
      }
      return false;
    }

    function hasReplyBelow(index: number): boolean {
      const descs = props.descendants as any[];
      if (index >= descs.length - 1)
        return false;
      const current = descs[index];
      const next = descs[index + 1];
      return !!next && !!current && next.inReplyToId === current.id;
    }

    function getReplyParent(reply: any, index: number): any {
      if (!reply.inReplyToId)
        return null;
      if (reply.inReplyToId === props.main.id)
        return null;
      if (index > 0) {
        const prev = (props.descendants as any[])[index - 1];
        if (prev && prev.id === reply.inReplyToId)
          return null;
      }
      const all = [
        ...(props.ancestors as any[]),
        props.main,
        ...(props.descendants as any[]),
      ];
      return all.find((s: any) => s.id === reply.inReplyToId) ?? null;
    }

    return { hasReplyAbove, hasReplyBelow, getReplyParent };
  },
  template: `
    <div style="max-width: 600px">
      <!-- Ancestors -->
      <StatusAncestor
        v-for="(ancestor, index) in ancestors"
        :key="ancestor.id"
        :status="ancestor"
        :show-connector="index < ancestors.length - 1 || !!main"
      />

      <!-- Connector bridge: last ancestor → main -->
      <div v-if="ancestors.length" class="relative h-3">
        <div class="absolute left-8 bottom-0 top-0 w-0.5 bg-accent" />
      </div>

      <!-- Main status -->
      <StatusDetailMain :status="main" />

      <!-- Quick reply -->
      <QuickReply
        v-if="showQuickReply"
        avatar-src="https://i.pravatar.cc/80?u=me"
        avatar-alt="You"
        reply-to-acct="alice"
      />

      <!-- Descendants with real thread logic -->
      <Status
        v-for="(reply, index) in descendants"
        :key="reply.id"
        :status="reply"
        :has-reply-above="hasReplyAbove(reply, index)"
        :has-reply-below="hasReplyBelow(index)"
        :reply-parent="getReplyParent(reply, index)"
      />
    </div>
  `,
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: '15-Recipes/Status Thread',
  component: ThreadLayout,
  tags: ['autodocs'],
} satisfies Meta<typeof ThreadLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * The most common thread pattern:
 * 2 ancestors → main post → 2 direct replies
 */
export const Default: Story = {
  args: {
    ancestors: [
      createMockStatus({
        id: 'a1',
        account: alice,
        content: '<p>What are your thoughts on the new Mastodon features?</p>',
        repliesCount: 3,
      }),
      createMockStatus({
        id: 'a2',
        account: sarah,
        content: '<p>The quote posts feature is a game changer. Finally we can properly reference other posts without screenshot dunking.</p>',
        inReplyToId: 'a1',
        repliesCount: 2,
        favouritesCount: 15,
      }),
    ],
    main: createMockStatus({
      id: 'main',
      content: '<p>Completely agree. And the new notification grouping makes the timeline so much cleaner. I was drowning in individual like notifications before.</p>',
      inReplyToId: 'a2',
      favouritesCount: 42,
      reblogsCount: 8,
      repliesCount: 4,
    }),
    descendants: [
      createMockStatus({
        id: 'd1',
        account: alex,
        content: '<p>The grouped notifications are great but I wish we could customize which types get grouped.</p>',
        inReplyToId: 'main',
        repliesCount: 1,
      }),
      createMockStatus({
        id: 'd2',
        account: jordan,
        content: '<p>Has anyone tried the new edit history feature? Being able to see what changed is really useful.</p>',
        inReplyToId: 'main',
        favouritesCount: 7,
      }),
    ],
  },
};

/**
 * Main post with no ancestors and no replies.
 * Tests that the layout works without any thread connections.
 */
export const SinglePost: Story = {
  args: {
    ancestors: [],
    main: createMockStatus({
      id: 'solo',
      content: '<p>Sometimes a post is just a post. No thread, no replies, just a thought floating in the feed.</p>',
      favouritesCount: 3,
    }),
    descendants: [],
  },
};

/**
 * Main post with replies but no ancestors.
 * Common for original posts that start conversations.
 */
export const NoAncestors: Story = {
  args: {
    ancestors: [],
    main: createMockStatus({
      id: 'main',
      content: '<p>Starting a new discussion: what\'s the best approach to state management in Vue 3?</p>',
      repliesCount: 3,
      favouritesCount: 18,
    }),
    descendants: [
      createMockStatus({
        id: 'd1',
        account: sarah,
        content: '<p>Pinia for global state, composables for shared logic. Keep it simple.</p>',
        inReplyToId: 'main',
        favouritesCount: 12,
      }),
      createMockStatus({
        id: 'd2',
        account: alex,
        content: '<p>I\'d add: use provide/inject for component tree scoping. Not everything needs to be global.</p>',
        inReplyToId: 'main',
        favouritesCount: 8,
      }),
    ],
  },
};

/**
 * Ancestors only, no replies.
 * Viewing a post that hasn't received any responses yet.
 */
export const NoDescendants: Story = {
  args: {
    ancestors: [
      createMockStatus({
        id: 'a1',
        account: sarah,
        content: '<p>Anyone going to VueConf this year?</p>',
        repliesCount: 1,
      }),
    ],
    main: createMockStatus({
      id: 'main',
      content: '<p>I\'ll be there! Giving a talk on composable patterns. Come say hi at the Fediway booth.</p>',
      inReplyToId: 'a1',
      favouritesCount: 5,
    }),
    descendants: [],
  },
};

/**
 * Reply chain: descendants reply to each other in sequence.
 * Tests the connected line between consecutive replies (hasReplyAbove + hasReplyBelow).
 */
export const ReplyChain: Story = {
  args: {
    ancestors: [],
    main: createMockStatus({
      id: 'main',
      content: '<p>Hot take: TypeScript strict mode should be the default.</p>',
      repliesCount: 4,
      favouritesCount: 31,
    }),
    descendants: [
      createMockStatus({
        id: 'd1',
        account: sarah,
        content: '<p>Agree. The number of bugs we caught after enabling strict was embarrassing.</p>',
        inReplyToId: 'main',
      }),
      createMockStatus({
        id: 'd2',
        account: alex,
        content: '<p>Same experience here. Especially with strictNullChecks — so many "cannot read property of undefined" bugs caught at compile time.</p>',
        inReplyToId: 'd1',
      }),
      createMockStatus({
        id: 'd3',
        account: jordan,
        content: '<p>The migration pain is real though. We had 2000+ errors when we turned it on.</p>',
        inReplyToId: 'd2',
      }),
      createMockStatus({
        id: 'd4',
        account: maya,
        content: '<p>Pro tip: enable one strict flag at a time. Start with strictNullChecks, then noImplicitAny, etc.</p>',
        inReplyToId: 'd3',
        favouritesCount: 15,
      }),
    ],
  },
};

/**
 * Mixed replies: some reply to main, some reply to each other.
 * Tests that only consecutive reply chains get connected lines,
 * while direct replies to main stand alone.
 */
export const MixedReplies: Story = {
  args: {
    ancestors: [],
    main: createMockStatus({
      id: 'main',
      content: '<p>What\'s your favorite book you\'ve read this year?</p>',
      repliesCount: 5,
      favouritesCount: 22,
    }),
    descendants: [
      createMockStatus({
        id: 'd1',
        account: sarah,
        content: '<p>Piranesi by Susanna Clarke. The atmosphere is incredible.</p>',
        inReplyToId: 'main',
        favouritesCount: 8,
      }),
      createMockStatus({
        id: 'd2',
        account: alex,
        content: '<p>Oh I loved that one too! The House descriptions are so vivid.</p>',
        inReplyToId: 'd1',
      }),
      createMockStatus({
        id: 'd3',
        account: jordan,
        content: '<p>For me it was Project Hail Mary. Andy Weir at his best.</p>',
        inReplyToId: 'main',
        favouritesCount: 5,
      }),
      createMockStatus({
        id: 'd4',
        account: maya,
        content: '<p>The Midnight Library by Matt Haig. Made me rethink a lot of choices.</p>',
        inReplyToId: 'main',
        favouritesCount: 3,
      }),
    ],
  },
};

/**
 * Deeply nested thread: 4 ancestors → main → 4-level reply chain.
 * Tests that long threads render correctly with continuous connector lines.
 */
export const DeeplyNested: Story = {
  args: {
    ancestors: [
      createMockStatus({
        id: 'a1',
        account: alice,
        content: '<p>Thread: My experience migrating from Twitter to the Fediverse (1/n)</p>',
        repliesCount: 1,
      }),
      createMockStatus({
        id: 'a2',
        account: alice,
        content: '<p>First, you need to pick an instance. This is the hardest part for newcomers because there\'s no single "sign up" button.</p>',
        inReplyToId: 'a1',
        repliesCount: 1,
      }),
      createMockStatus({
        id: 'a3',
        account: alice,
        content: '<p>I started on mastodon.social but moved to a smaller community-focused instance. The local timeline makes all the difference.</p>',
        inReplyToId: 'a2',
        repliesCount: 1,
      }),
      createMockStatus({
        id: 'a4',
        account: alice,
        content: '<p>The culture is different too. No algorithm pushing engagement bait. Conversations feel genuine again.</p>',
        inReplyToId: 'a3',
        repliesCount: 1,
      }),
    ],
    main: createMockStatus({
      id: 'main',
      content: '<p>Six months in and I don\'t miss Twitter at all. The Fediverse isn\'t perfect, but it feels like the internet I grew up with.</p>',
      inReplyToId: 'a4',
      favouritesCount: 156,
      reblogsCount: 43,
      repliesCount: 12,
    }),
    descendants: [
      createMockStatus({
        id: 'd1',
        account: sarah,
        content: '<p>This resonates so much. The smaller community feel is what keeps me here.</p>',
        inReplyToId: 'main',
      }),
      createMockStatus({
        id: 'd2',
        account: alex,
        content: '<p>Same. And the lack of quote-tweet dunking culture is refreshing.</p>',
        inReplyToId: 'd1',
      }),
      createMockStatus({
        id: 'd3',
        account: jordan,
        content: '<p>Though quote posts are coming! Hopefully they won\'t bring the dunking culture with them.</p>',
        inReplyToId: 'd2',
      }),
      createMockStatus({
        id: 'd4',
        account: maya,
        content: '<p>Mastodon\'s implementation requires approval from the quoted user. That\'s a thoughtful safeguard.</p>',
        inReplyToId: 'd3',
        favouritesCount: 24,
      }),
    ],
  },
};

/**
 * Reply with orphaned parent: a reply references a post that isn't
 * the previous descendant. Shows the reply-parent context card.
 */
export const OrphanedReplyParent: Story = {
  args: {
    ancestors: [],
    main: createMockStatus({
      id: 'main',
      content: '<p>What do you all think about the CSS container queries spec?</p>',
      repliesCount: 3,
    }),
    descendants: [
      createMockStatus({
        id: 'd1',
        account: sarah,
        content: '<p>Game changer for component-level responsive design.</p>',
        inReplyToId: 'main',
      }),
      createMockStatus({
        id: 'd2',
        account: alex,
        content: '<p>Finally we don\'t need ResizeObserver hacks.</p>',
        inReplyToId: 'main',
      }),
      // This reply is to d1, but d1 is not the previous descendant (d2 is) —
      // so it should show a reply-parent context card for d1
      createMockStatus({
        id: 'd3',
        account: jordan,
        content: '<p>Exactly! I\'ve been using them in production for three months. No issues.</p>',
        inReplyToId: 'd1',
      }),
    ],
  },
};

/**
 * Thread with quick reply visible.
 * Shows the composer positioned between main and descendants.
 */
export const WithQuickReply: Story = {
  args: {
    ancestors: [
      createMockStatus({
        id: 'a1',
        account: sarah,
        content: '<p>Should we use Tailwind or plain CSS for the design system?</p>',
      }),
    ],
    main: createMockStatus({
      id: 'main',
      content: '<p>Tailwind with CVA for variant management. Best of both worlds.</p>',
      inReplyToId: 'a1',
      favouritesCount: 14,
      repliesCount: 1,
    }),
    descendants: [
      createMockStatus({
        id: 'd1',
        account: alex,
        content: '<p>Solid choice. We use the same stack and it scales really well.</p>',
        inReplyToId: 'main',
      }),
    ],
    showQuickReply: true,
  },
};

/**
 * Single reply to main — no chain, no ancestors.
 * Tests that a lone reply doesn't show any connector lines.
 */
export const SingleReply: Story = {
  args: {
    ancestors: [],
    main: createMockStatus({
      id: 'main',
      content: '<p>Does anyone have a good sourdough starter recipe?</p>',
      repliesCount: 1,
    }),
    descendants: [
      createMockStatus({
        id: 'd1',
        account: maya,
        content: '<p>Equal parts flour and water by weight, feed daily for 7 days. Discard half before each feeding. You\'ll know it\'s ready when it doubles in 4-6 hours.</p>',
        inReplyToId: 'main',
        favouritesCount: 12,
      }),
    ],
  },
};

/**
 * Long ancestor post content — tests that the ThreadConnector
 * stretches correctly with varying content heights.
 */
export const LongAncestorContent: Story = {
  args: {
    ancestors: [
      createMockStatus({
        id: 'a1',
        account: alice,
        content: `<p>${'This is an extremely long post that tests how the thread connector handles variable-height content. The line should stretch smoothly from this post all the way down to the next one without any gaps or misalignment. '.repeat(3)}</p>`,
        repliesCount: 1,
      }),
      createMockStatus({
        id: 'a2',
        account: sarah,
        content: '<p>Short reply.</p>',
        inReplyToId: 'a1',
        repliesCount: 1,
      }),
    ],
    main: createMockStatus({
      id: 'main',
      content: '<p>And a medium-length main post to see how the different heights play together.</p>',
      inReplyToId: 'a2',
      favouritesCount: 5,
    }),
    descendants: [],
  },
};
