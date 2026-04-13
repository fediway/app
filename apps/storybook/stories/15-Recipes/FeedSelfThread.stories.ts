import type { Status as StatusType } from '@repo/types';
import type { Meta, StoryObj } from '@storybook/vue3';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import { shapeFeedThreads, Status } from '@/components/status';
import { createMockAccount, createMockStatus } from '../../mocks';

const alice = createMockAccount({ id: '1', displayName: 'Alice Chen', username: 'alice' });
const sarah = createMockAccount({ id: '2', displayName: 'Sarah Rivera', username: 'sarah' });
const alex = createMockAccount({ id: '3', displayName: 'Alex Kim', username: 'alex' });
const jordan = createMockAccount({ id: '4', displayName: 'Jordan Lee', username: 'jordan' });

const FeedLayout = defineComponent({
  name: 'FeedLayout',
  components: { Status },
  props: {
    statuses: { type: Array as PropType<StatusType[]>, required: true },
  },
  setup(props) {
    const positions = computed(() =>
      shapeFeedThreads(props.statuses, () => null),
    );
    return { positions };
  },
  template: `
    <div style="max-width: 600px">
      <Status
        v-for="(status, i) in statuses"
        :key="status.id"
        :status="status"
        :thread-position="positions[i]"
      />
    </div>
  `,
});

const meta = {
  title: '15-Recipes/Feed Self-Thread',
  component: FeedLayout,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Feed-level rendering driven by `shapeFeedThreads()`. The shaper '
          + 'detects runs of adjacent self-thread posts (same author, each one '
          + 'replying to the previous) and links them with a continuous rail '
          + '— the way Twitter shows author threads inline in the timeline.',
      },
    },
  },
} satisfies Meta<typeof FeedLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Three consecutive feed posts by the same author forming a self-thread.
 * The shaper detects the chain and renders a continuous rail through all three.
 */
export const SelfThreadOfThree: Story = {
  args: {
    statuses: [
      createMockStatus({
        id: 'a1',
        account: alice,
        content: '<p>Thread time: I just shipped the new thread connector system at work and I have OPINIONS about how the FAANGs do this (1/3)</p>',
        favouritesCount: 47,
      }),
      createMockStatus({
        id: 'a2',
        account: alice,
        content: '<p>Twitter and Bluesky both use a single muted vertical rail. They never vary the color by context. The rail is structural furniture, not a signal. Treating it as anything else creates noise. (2/3)</p>',
        inReplyToId: 'a1',
        favouritesCount: 31,
      }),
      createMockStatus({
        id: 'a3',
        account: alice,
        content: '<p>The biggest thing nobody talks about: the rail should NEVER pass behind the avatar. Anti-aliasing intersection muddies the avatar edge. Always terminate cleanly. (3/3)</p>',
        inReplyToId: 'a2',
        favouritesCount: 89,
      }),
    ],
  },
};

/**
 * Self-thread broken up by other authors. Only the consecutive same-author
 * adjacent pair links — the standalone post by another author in between
 * keeps the chain from spanning further.
 */
export const SelfThreadInterruptedByOtherAuthor: Story = {
  args: {
    statuses: [
      createMockStatus({
        id: 'a1',
        account: alice,
        content: '<p>Starting a thread on database choice (1/n)</p>',
      }),
      createMockStatus({
        id: 'a2',
        account: alice,
        content: '<p>Postgres is the default unless you have a specific reason. Boring tech wins. (2/n)</p>',
        inReplyToId: 'a1',
      }),
      // Different author breaks the chain
      createMockStatus({
        id: 's1',
        account: sarah,
        content: '<p>Unrelated post by another author — interrupts the chain.</p>',
      }),
      createMockStatus({
        id: 'a3',
        account: alice,
        content: '<p>Continuation of the original thread, but no longer adjacent — should NOT link to a1/a2.</p>',
        inReplyToId: 'a2',
      }),
    ],
  },
};

/**
 * Mixed feed — some self-threads, some standalone posts, some replies to
 * other people. The shaper picks out only the valid linked runs.
 */
export const MixedFeed: Story = {
  args: {
    statuses: [
      createMockStatus({
        id: 'p1',
        account: alex,
        content: '<p>Standalone post by alex.</p>',
      }),
      createMockStatus({
        id: 'p2',
        account: alice,
        content: '<p>Alice starts a 2-post self-thread (1/2)</p>',
      }),
      createMockStatus({
        id: 'p3',
        account: alice,
        content: '<p>Alice continuation (2/2). Linked to p2 above.</p>',
        inReplyToId: 'p2',
      }),
      createMockStatus({
        id: 'p4',
        account: jordan,
        content: '<p>Standalone post by jordan.</p>',
      }),
      createMockStatus({
        id: 'p5',
        account: sarah,
        content: '<p>Sarah replies to alice — different author, no link.</p>',
        inReplyToId: 'p3',
      }),
      createMockStatus({
        id: 'p6',
        account: alex,
        content: '<p>Alex starts another self-thread (1/3)</p>',
      }),
      createMockStatus({
        id: 'p7',
        account: alex,
        content: '<p>Alex (2/3)</p>',
        inReplyToId: 'p6',
      }),
      createMockStatus({
        id: 'p8',
        account: alex,
        content: '<p>Alex (3/3)</p>',
        inReplyToId: 'p7',
      }),
    ],
  },
};

/**
 * A reblog interrupts a self-thread chain. Reblogs never participate in
 * linking — even if the underlying status would technically chain.
 */
export const ReblogBreaksChain: Story = {
  args: {
    statuses: [
      createMockStatus({
        id: 'a1',
        account: alice,
        content: '<p>Self-thread post 1 by alice.</p>',
      }),
      createMockStatus({
        id: 'reblog',
        account: jordan,
        reblog: createMockStatus({
          id: 'reblogged',
          account: sarah,
          content: '<p>Reposted post by sarah, reblogged by jordan.</p>',
        }),
      }),
      createMockStatus({
        id: 'a2',
        account: alice,
        content: '<p>Self-thread post 2 by alice — would chain to a1, but the reblog above breaks adjacency.</p>',
        inReplyToId: 'a1',
      }),
    ],
  },
};

/**
 * Edge case — a self-thread that would link is interrupted by a non-reply
 * standalone post by the same author. The standalone is not in the chain.
 */
export const SameAuthorButNotReplying: Story = {
  args: {
    statuses: [
      createMockStatus({
        id: 'a1',
        account: alice,
        content: '<p>Alice post 1 — start of an intended thread.</p>',
      }),
      createMockStatus({
        id: 'a2',
        account: alice,
        content: '<p>Alice post 2 — by the same author but NOT a reply to a1. Should not link.</p>',
      }),
      createMockStatus({
        id: 'a3',
        account: alice,
        content: '<p>Alice post 3 — replies to a2, should link to a2.</p>',
        inReplyToId: 'a2',
      }),
    ],
  },
};
