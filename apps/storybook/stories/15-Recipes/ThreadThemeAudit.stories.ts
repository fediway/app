import type { Meta, StoryObj } from '@storybook/vue3';
import { defineComponent } from 'vue';
import {
  DeletedStatusTombstone,
  Status,
  ThreadCollapseNode,
  ThreadSkeleton,
} from '@/components/status';
import { createMockAccount, createMockStatus } from '../../mocks';
import { lightDarkDecorator } from '../decorators';

const alice = createMockAccount({ id: '1', displayName: 'Alice Chen', username: 'alice' });
const sarah = createMockAccount({ id: '2', displayName: 'Sarah Rivera', username: 'sarah' });
const alex = createMockAccount({ id: '3', displayName: 'Alex Kim', username: 'alex' });
const jordan = createMockAccount({ id: '4', displayName: 'Jordan Lee', username: 'jordan' });

const Wrapper = defineComponent({
  name: 'AuditWrapper',
  template: '<div><slot /></div>',
});

const meta = {
  title: '15-Recipes/Thread Theme Audit',
  component: Wrapper,
  tags: ['autodocs'],
  decorators: [lightDarkDecorator],
  parameters: {
    docs: {
      description: {
        component:
          'Side-by-side light/dark renders of every thread atom and recipe. '
          + 'Use this view to verify that rail color, tombstone background, '
          + 'collapse-node avatar rings, OP badge contrast, and skeleton '
          + 'shimmer all look balanced in both themes.',
      },
    },
  },
} satisfies Meta<typeof Wrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Chain: Story = {
  name: 'Three-post chain',
  render: () => ({
    components: { Status },
    setup() {
      const a = createMockStatus({
        id: '1',
        account: alice,
        content: '<p>First post in the chain — chain-start, no rail above.</p>',
      });
      const b = createMockStatus({
        id: '2',
        account: sarah,
        content: '<p>Middle post — connected above and below, rail flows through both edges of the avatar.</p>',
      });
      const c = createMockStatus({
        id: '3',
        account: alex,
        content: '<p>Last post — chain-end, rail above only.</p>',
      });
      return { a, b, c };
    },
    template: `
      <div>
        <Status :status="a" :thread-position="{ kind: 'chain-start' }" :show-separator="false" />
        <Status :status="b" :thread-position="{ kind: 'chain-middle' }" :show-separator="false" />
        <Status :status="c" :thread-position="{ kind: 'chain-end' }" />
      </div>
    `,
  }),
};

export const Tombstone: Story = {
  name: 'Tombstone in chain',
  render: () => ({
    components: { Status, DeletedStatusTombstone },
    setup() {
      const a = createMockStatus({
        id: '1',
        account: alice,
        content: '<p>Real post above the tombstone.</p>',
      });
      const b = createMockStatus({
        id: '3',
        account: sarah,
        content: '<p>Real post below the tombstone.</p>',
      });
      return { a, b };
    },
    template: `
      <div>
        <Status :status="a" :thread-position="{ kind: 'chain-start' }" :show-separator="false" />
        <DeletedStatusTombstone :thread-position="{ kind: 'chain-middle' }" reason="deleted" :show-separator="false" />
        <Status :status="b" :thread-position="{ kind: 'chain-end' }" />
      </div>
    `,
  }),
};

export const CollapseNode: Story = {
  name: 'Collapse node in chain',
  render: () => ({
    components: { Status, ThreadCollapseNode },
    setup() {
      const a = createMockStatus({
        id: '1',
        account: alice,
        content: '<p>Real post above the collapse.</p>',
      });
      const b = createMockStatus({
        id: '3',
        account: jordan,
        content: '<p>Real post below the collapse.</p>',
      });
      return { a, b, accounts: [sarah, alex, jordan] };
    },
    template: `
      <div>
        <Status :status="a" :thread-position="{ kind: 'chain-start' }" :show-separator="false" />
        <ThreadCollapseNode
          :thread-position="{ kind: 'chain-middle' }"
          :accounts="accounts"
          :hidden-count="12"
          :show-separator="false"
        />
        <Status :status="b" :thread-position="{ kind: 'chain-end' }" />
      </div>
    `,
  }),
};

export const AuthorBadge: Story = {
  name: 'OP "Author" badge',
  render: () => ({
    components: { Status },
    setup() {
      const status = createMockStatus({
        id: '1',
        account: alice,
        content: '<p>Reply by the same author as the focused post — verify the Author pill has enough contrast in both themes.</p>',
      });
      return { status };
    },
    template: `
      <div>
        <Status :status="status" :is-author-reply="true" />
      </div>
    `,
  }),
};

export const Skeleton: Story = {
  name: 'Loading skeleton',
  render: () => ({
    components: { ThreadSkeleton },
    template: `
      <div>
        <ThreadSkeleton :ancestors="1" :descendants="2" />
      </div>
    `,
  }),
};
