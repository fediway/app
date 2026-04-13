import type { Meta, StoryObj } from '@storybook/vue3';
import { defineComponent } from 'vue';
import {
  DeletedStatusTombstone,
  Status,
  StatusDetailMain,
  ThreadCollapseNode,
} from '@/components/status';
import { createMockAccount, createMockStatus } from '../../mocks';

const alice = createMockAccount({ id: '1', displayName: 'Alice Chen', username: 'alice' });
const sarah = createMockAccount({ id: '2', displayName: 'Sarah Rivera', username: 'sarah' });
const alex = createMockAccount({ id: '3', displayName: 'Alex Kim', username: 'alex' });
const jordan = createMockAccount({ id: '4', displayName: 'Jordan Lee', username: 'jordan' });
const maya = createMockAccount({ id: '5', displayName: 'Maya Patel', username: 'maya' });

const Wrapper = defineComponent({
  name: 'EdgeCaseWrapper',
  template: '<div style="max-width: 600px"><slot /></div>',
});

const meta = {
  title: '15-Recipes/Status Thread Edge Cases',
  component: Wrapper,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Edge-case thread shapes that exercise the tombstone and collapse '
          + 'atoms inside realistic full-thread layouts. Each story is a '
          + 'separate scenario from the matrix that the basic recipe doesn\'t cover.',
      },
    },
  },
} satisfies Meta<typeof Wrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DeletedAncestor: Story = {
  name: 'D7a — Deleted post in the ancestor chain',
  render: () => ({
    components: { Status, DeletedStatusTombstone, StatusDetailMain },
    setup() {
      const a1 = createMockStatus({
        id: 'a1',
        account: alice,
        content: '<p>Quick poll: which build tool do you reach for first?</p>',
      });
      const main = createMockStatus({
        id: 'main',
        content: '<p>Vite for everything except massive monorepos. Then turbo for orchestration.</p>',
        inReplyToId: 'a3',
        favouritesCount: 23,
      });
      return { a1, main };
    },
    template: `
      <div style="max-width: 600px">
        <Status :status="a1" :thread-position="{ kind: 'chain-start' }" :hide-actions="true" :show-separator="false" />
        <DeletedStatusTombstone :thread-position="{ kind: 'chain-middle' }" reason="deleted" :show-separator="false" />
        <StatusDetailMain :status="main" />
      </div>
    `,
  }),
};

export const DeletedDescendant: Story = {
  name: 'D7b — Deleted post in the descendant chain',
  render: () => ({
    components: { Status, DeletedStatusTombstone, StatusDetailMain },
    setup() {
      const main = createMockStatus({
        id: 'main',
        account: alice,
        content: '<p>What\'s your favorite obscure terminal trick?</p>',
        favouritesCount: 31,
        repliesCount: 4,
      });
      const d1 = createMockStatus({
        id: 'd1',
        account: sarah,
        content: '<p>`!!` to repeat the last command with sudo. Saves my life daily.</p>',
        inReplyToId: 'main',
      });
      const d3 = createMockStatus({
        id: 'd3',
        account: jordan,
        content: '<p>That\'s a great one — also `cd -` to bounce back to the previous directory.</p>',
        inReplyToId: 'd2',
      });
      return { main, d1, d3 };
    },
    template: `
      <div style="max-width: 600px">
        <StatusDetailMain :status="main" />
        <Status :status="d1" :thread-position="{ kind: 'chain-start' }" :show-separator="false" />
        <DeletedStatusTombstone :thread-position="{ kind: 'chain-middle' }" reason="unavailable" :show-separator="false" />
        <Status :status="d3" :thread-position="{ kind: 'chain-end' }" />
      </div>
    `,
  }),
};

export const DeletedAtMultiplePositions: Story = {
  name: 'D7c — Multiple deleted posts in one thread',
  render: () => ({
    components: { Status, DeletedStatusTombstone, StatusDetailMain },
    setup() {
      const a1 = createMockStatus({ id: 'a1', account: alice, content: '<p>Thread on async/await pitfalls (1/n)</p>' });
      const main = createMockStatus({
        id: 'main',
        account: alice,
        content: '<p>The biggest one: forgetting to await inside a `.map()` and ending up with an array of pending promises.</p>',
        favouritesCount: 89,
        reblogsCount: 14,
      });
      const d1 = createMockStatus({
        id: 'd1',
        account: maya,
        content: '<p>Promise.all is your friend here.</p>',
        inReplyToId: 'main',
      });
      return { a1, main, d1 };
    },
    template: `
      <div style="max-width: 600px">
        <Status :status="a1" :thread-position="{ kind: 'chain-start' }" :hide-actions="true" :show-separator="false" />
        <DeletedStatusTombstone :thread-position="{ kind: 'chain-middle' }" reason="deleted" :show-separator="false" />
        <DeletedStatusTombstone :thread-position="{ kind: 'chain-middle' }" reason="unavailable" :show-separator="false" />
        <StatusDetailMain :status="main" />
        <Status :status="d1" :thread-position="{ kind: 'chain-start' }" :show-separator="false" />
        <DeletedStatusTombstone :thread-position="{ kind: 'chain-end' }" reason="deleted" />
      </div>
    `,
  }),
};

export const CollapsedDescendantChain: Story = {
  name: 'C-collapse — Long reply chain with collapse node',
  render: () => ({
    components: { Status, ThreadCollapseNode, StatusDetailMain },
    setup() {
      const main = createMockStatus({
        id: 'main',
        account: alice,
        content: '<p>What\'s the case for AND against monorepos in 2026?</p>',
        favouritesCount: 142,
        repliesCount: 28,
      });
      const d1 = createMockStatus({
        id: 'd1',
        account: sarah,
        content: '<p>Pro: atomic refactors across packages. Con: slow CI if you don\'t cache aggressively.</p>',
        inReplyToId: 'main',
      });
      const d2 = createMockStatus({
        id: 'd2',
        account: alex,
        content: '<p>Disagree on the slow CI — turbo and nx solve that pretty well now.</p>',
        inReplyToId: 'd1',
      });
      const dLast = createMockStatus({
        id: 'dLast',
        account: maya,
        content: '<p>The deepest reply, surfaced after the collapse expands.</p>',
        inReplyToId: 'dN',
      });
      return { main, d1, d2, dLast, accounts: [jordan, alex, sarah] };
    },
    template: `
      <div style="max-width: 600px">
        <StatusDetailMain :status="main" />
        <Status :status="d1" :thread-position="{ kind: 'chain-start' }" :show-separator="false" />
        <Status :status="d2" :thread-position="{ kind: 'chain-middle' }" :show-separator="false" />
        <ThreadCollapseNode
          :thread-position="{ kind: 'chain-middle' }"
          :accounts="accounts"
          :hidden-count="14"
          :show-separator="false"
        />
        <Status :status="dLast" :thread-position="{ kind: 'chain-end' }" />
      </div>
    `,
  }),
};

export const CollapsedAncestorChain: Story = {
  name: 'B-collapse — Long ancestor chain with collapse node',
  render: () => ({
    components: { Status, ThreadCollapseNode, StatusDetailMain },
    setup() {
      const root = createMockStatus({
        id: 'root',
        account: alice,
        content: '<p>Starting a long thread on RFC 7807 problem details and why everyone gets it wrong (1/n)</p>',
      });
      const lastAncestor = createMockStatus({
        id: 'la',
        account: alice,
        content: '<p>And finally — the right way to extend it for your domain without breaking the spec.</p>',
      });
      const main = createMockStatus({
        id: 'main',
        account: alice,
        content: '<p>If you only remember one thing from this thread: `type` is your URI namespace, not your error code. Treat it accordingly.</p>',
        favouritesCount: 412,
        reblogsCount: 87,
      });
      return { root, lastAncestor, main, accounts: [alice] };
    },
    template: `
      <div style="max-width: 600px">
        <Status :status="root" :thread-position="{ kind: 'chain-start' }" :hide-actions="true" :show-separator="false" />
        <ThreadCollapseNode
          :thread-position="{ kind: 'chain-middle' }"
          :accounts="accounts"
          :hidden-count="11"
          :show-separator="false"
        />
        <Status :status="lastAncestor" :thread-position="{ kind: 'chain-middle' }" :hide-actions="true" :show-separator="false" />
        <StatusDetailMain :status="main" />
      </div>
    `,
  }),
};

export const TombstoneAndCollapseTogether: Story = {
  name: 'D7+collapse — Both atoms in one thread',
  render: () => ({
    components: { Status, DeletedStatusTombstone, ThreadCollapseNode, StatusDetailMain },
    setup() {
      const root = createMockStatus({
        id: 'r',
        account: alice,
        content: '<p>Hot take thread on database choice for greenfield projects.</p>',
      });
      const main = createMockStatus({
        id: 'main',
        account: alice,
        content: '<p>Default to Postgres unless you have a specific reason not to. Boring tech wins.</p>',
        favouritesCount: 256,
      });
      const d1 = createMockStatus({
        id: 'd1',
        account: sarah,
        content: '<p>Cosigned. Postgres scales further than people think.</p>',
        inReplyToId: 'main',
      });
      const dLast = createMockStatus({
        id: 'dl',
        account: maya,
        content: '<p>SQLite for anything where a single writer is fine. Underrated.</p>',
      });
      return { root, main, d1, dLast, accounts: [jordan, alex, maya] };
    },
    template: `
      <div style="max-width: 600px">
        <Status :status="root" :thread-position="{ kind: 'chain-start' }" :hide-actions="true" :show-separator="false" />
        <DeletedStatusTombstone :thread-position="{ kind: 'chain-middle' }" reason="deleted" :show-separator="false" />
        <StatusDetailMain :status="main" />
        <Status :status="d1" :thread-position="{ kind: 'chain-start' }" :show-separator="false" />
        <ThreadCollapseNode
          :thread-position="{ kind: 'chain-middle' }"
          :accounts="accounts"
          :hidden-count="9"
          :show-separator="false"
        />
        <Status :status="dLast" :thread-position="{ kind: 'chain-end' }" />
      </div>
    `,
  }),
};
