import type { Status as StatusType } from '@repo/types';
import type { Meta, StoryObj } from '@storybook/vue3';
import type { PropType } from 'vue';
import { computed, defineComponent, ref } from 'vue';
import { DeletedStatusTombstone, QuickReply, shapeThreadContext, Status, StatusDetailMain, ThreadCollapseNode } from '@/components/status';
import { createMockAccount, createMockStatus } from '../../mocks';

const alice = createMockAccount({ id: '1', displayName: 'Alice Chen', username: 'alice' });
const sarah = createMockAccount({ id: '2', displayName: 'Sarah Rivera', username: 'sarah' });
const alex = createMockAccount({ id: '3', displayName: 'Alex Kim', username: 'alex' });
const jordan = createMockAccount({ id: '4', displayName: 'Jordan Lee', username: 'jordan' });
const maya = createMockAccount({ id: '5', displayName: 'Maya Patel', username: 'maya' });

/**
 * Thread layout recipe — the canonical thread rendering. Mirrors
 * `apps/web/app/pages/@[acct]/[id]/index.vue` exactly so stories
 * are a faithful preview of the production page.
 */
const ThreadLayout = defineComponent({
  name: 'ThreadLayout',
  components: { StatusDetailMain, Status, QuickReply, ThreadCollapseNode, DeletedStatusTombstone },
  props: {
    ancestors: { type: Array as PropType<StatusType[]>, default: () => [] },
    main: { type: Object as PropType<StatusType>, required: true },
    descendants: { type: Array as PropType<StatusType[]>, default: () => [] },
    showQuickReply: { type: Boolean, default: false },
  },
  setup(props) {
    const expandedKeys = ref<Set<string>>(new Set());

    const shaped = computed(() =>
      shapeThreadContext({
        ancestors: props.ancestors,
        main: props.main,
        descendants: props.descendants,
        expandedKeys: expandedKeys.value,
      }),
    );

    function expand(key: string) {
      expandedKeys.value = new Set([...expandedKeys.value, key]);
    }

    return { shaped, expand };
  },
  template: `
    <div style="max-width: 600px">
      <template v-for="item in shaped.ancestors" :key="item.kind === 'status' ? item.status.id : item.key">
        <Status
          v-if="item.kind === 'status'"
          :status="item.status"
          :thread-position="item.position"
          :is-author-reply="item.isAuthorReply"
          :hide-actions="true"
          :show-separator="false"
        />
        <ThreadCollapseNode
          v-else-if="item.kind === 'collapse'"
          :accounts="item.accounts"
          :hidden-count="item.hiddenCount"
          :thread-position="item.position"
          :show-separator="false"
          @expand="expand(item.key)"
        />
        <DeletedStatusTombstone
          v-else
          :reason="item.reason"
          :thread-position="item.position"
          :show-separator="false"
        />
      </template>
      <StatusDetailMain :status="main" />
      <QuickReply
        v-if="showQuickReply"
        avatar-src="https://i.pravatar.cc/80?u=me"
        avatar-alt="You"
        reply-to-acct="alice"
      />
      <template v-for="item in shaped.descendants" :key="item.kind === 'status' ? item.status.id : item.key">
        <Status
          v-if="item.kind === 'status'"
          :status="item.status"
          :thread-position="item.position"
          :is-author-reply="item.isAuthorReply"
        />
        <ThreadCollapseNode
          v-else-if="item.kind === 'collapse'"
          :accounts="item.accounts"
          :hidden-count="item.hiddenCount"
          :thread-position="item.position"
          :show-separator="false"
          @expand="expand(item.key)"
        />
        <DeletedStatusTombstone
          v-else
          :reason="item.reason"
          :thread-position="item.position"
          :show-separator="false"
        />
      </template>
    </div>
  `,
});

const meta = {
  title: '15-Recipes/Status Thread',
  component: ThreadLayout,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'End-to-end thread rendering using `shapeThreadContext()` — the same '
          + 'transformer used in production. Each story exercises a different '
          + 'thread shape from the scenario matrix.',
      },
    },
  },
} satisfies Meta<typeof ThreadLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

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
      createMockStatus({
        id: 'd3',
        account: jordan,
        content: '<p>Exactly! I\'ve been using them in production for three months. No issues.</p>',
        inReplyToId: 'd1',
      }),
    ],
  },
};

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
 * OP self-reply highlight — the focused post's author replies to themselves
 * within the descendant chain. The shaper marks each matching reply with
 * `isAuthorReply: true` and Status renders an "Author" badge in the header.
 */
export const AuthorRepliesHighlighted: Story = {
  args: {
    ancestors: [],
    main: createMockStatus({
      id: 'main',
      account: alice,
      content: '<p>Hot take: every codebase eventually needs a "lib/" directory whether you plan for it or not.</p>',
      favouritesCount: 73,
      repliesCount: 4,
    }),
    descendants: [
      createMockStatus({
        id: 'd1',
        account: sarah,
        content: '<p>Counterpoint: starting with `lib/` from day one creates a junk drawer.</p>',
        inReplyToId: 'main',
      }),
      createMockStatus({
        id: 'd2',
        account: alice,
        content: '<p>Fair — the better framing is "name things by domain not by layer". The junk drawer happens when you organize by layer.</p>',
        inReplyToId: 'd1',
      }),
      createMockStatus({
        id: 'd3',
        account: alex,
        content: '<p>This is exactly the framing I needed for our refactor.</p>',
        inReplyToId: 'd2',
      }),
      createMockStatus({
        id: 'd4',
        account: alice,
        content: '<p>Glad it lands. The "name by domain" rule is the single biggest leverage point I\'ve found.</p>',
        inReplyToId: 'd3',
      }),
    ],
  },
};

/**
 * Orphan reply whose parent doesn't exist in the context — the shaper
 * auto-emits a `DeletedStatusTombstone` immediately above it. Demonstrates
 * the "missing parent" auto-detection.
 */
export const OrphanWithMissingParent: Story = {
  name: 'Orphan with missing parent (auto tombstone)',
  args: {
    ancestors: [],
    main: createMockStatus({
      id: 'main',
      account: alice,
      content: '<p>Tip: stop committing lockfile changes from autofixes.</p>',
      favouritesCount: 47,
    }),
    descendants: [
      createMockStatus({
        id: 'd1',
        account: sarah,
        content: '<p>Cosigned. Pin your tooling versions.</p>',
        inReplyToId: 'main',
      }),
      createMockStatus({
        id: 'd2',
        account: alex,
        content: '<p>Replying to a post that no longer exists — the shaper renders a tombstone above me to acknowledge the gap honestly.</p>',
        inReplyToId: 'ghost-id-that-does-not-exist',
      }),
      createMockStatus({
        id: 'd3',
        account: jordan,
        content: '<p>Same missing parent — the shaper does not duplicate the tombstone.</p>',
        inReplyToId: 'ghost-id-that-does-not-exist',
      }),
    ],
  },
};

/**
 * 9-post ancestor chain — exceeds the auto-collapse threshold (6).
 * Shaper keeps the first ancestor + last 2, collapses the middle 6.
 */
export const AutoCollapsedAncestors: Story = {
  args: {
    ancestors: Array.from({ length: 9 }, (_, i) => createMockStatus({
      id: `a${i + 1}`,
      account: alice,
      content: `<p>Ancestor post ${i + 1} of 9 — long thread of context that should auto-collapse the middle.</p>`,
      inReplyToId: i === 0 ? undefined : `a${i}`,
    })),
    main: createMockStatus({
      id: 'main',
      content: '<p>The focused post — by this point you should only see the first ancestor + the last two + a collapse node in between.</p>',
      inReplyToId: 'a9',
      favouritesCount: 89,
    }),
    descendants: [],
  },
};

/**
 * Deep descendant chain — exceeds depth 3 from main. The shaper folds
 * everything past depth 3 into a single collapse node.
 */
export const AutoCollapsedDescendants: Story = {
  args: {
    ancestors: [],
    main: createMockStatus({
      id: 'main',
      account: alice,
      content: '<p>What\'s the worst kind of technical debt you\'ve inherited?</p>',
      favouritesCount: 142,
      repliesCount: 7,
    }),
    descendants: [
      createMockStatus({ id: 'd0', account: sarah, content: '<p>A 4000-line god class with no tests.</p>', inReplyToId: 'main' }),
      createMockStatus({ id: 'd1', account: alex, content: '<p>How long did the rewrite take?</p>', inReplyToId: 'd0' }),
      createMockStatus({ id: 'd2', account: jordan, content: '<p>Months. We did it incrementally with a strangler fig pattern.</p>', inReplyToId: 'd1' }),
      createMockStatus({ id: 'd3', account: maya, content: '<p>Strangler fig is underrated.</p>', inReplyToId: 'd2' }),
      // depth 4+ — collapsed
      createMockStatus({ id: 'd4', account: sarah, content: '<p>Especially when you can keep the old code running side-by-side.</p>', inReplyToId: 'd3' }),
      createMockStatus({ id: 'd5', account: alex, content: '<p>Yes, and route a percentage of traffic to validate.</p>', inReplyToId: 'd4' }),
      createMockStatus({ id: 'd6', account: jordan, content: '<p>That\'s exactly what we did. Started at 1%.</p>', inReplyToId: 'd5' }),
    ],
  },
};

export const LongAncestorContent: Story = {
  args: {
    ancestors: [
      createMockStatus({
        id: 'a1',
        account: alice,
        content: `<p>${'This is an extremely long post that tests how the thread rail handles variable-height content. The line should stretch smoothly from this post all the way down to the next one without any gaps or misalignment. '.repeat(3)}</p>`,
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
