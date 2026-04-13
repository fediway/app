import type { Meta, StoryObj } from '@storybook/vue3';
import DeletedStatusTombstone from '@/components/status/DeletedStatusTombstone.vue';
import Status from '@/components/status/Status.vue';
import { createMockAccount, createMockStatus } from '../../mocks';
import { wideDecorator } from '../decorators';

const meta = {
  title: '07-Status/DeletedStatusTombstone',
  component: DeletedStatusTombstone,
  tags: ['autodocs'],
  decorators: [wideDecorator],
  parameters: {
    docs: {
      description: {
        component:
          'Compact ghost card that replaces a deleted or unavailable post in '
          + 'a thread. Same horizontal footprint and avatar-column geometry as '
          + 'a regular `Status` so the rail flows through unchanged. The card '
          + 'itself carries the "missing" signal — the rail stays solid.',
      },
    },
  },
} satisfies Meta<typeof DeletedStatusTombstone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standalone_Unavailable: Story = {
  name: 'Standalone — unavailable',
  args: {
    threadPosition: { kind: 'standalone' },
    reason: 'unavailable',
  },
};

export const Standalone_Deleted: Story = {
  name: 'Standalone — deleted',
  args: {
    threadPosition: { kind: 'standalone' },
    reason: 'deleted',
  },
};

export const ChainMiddle: Story = {
  name: 'In chain (middle) — rail passes through',
  args: {
    threadPosition: { kind: 'chain-middle' },
    reason: 'unavailable',
    showSeparator: false,
  },
};

export const InsideChain: Story = {
  name: 'Realistic — tombstone between two real posts',
  parameters: {
    docs: {
      description: {
        story:
          'A reply chain where the middle post is unavailable. Verifies the '
          + 'rail flows continuously through the tombstone without any visual break.',
      },
    },
  },
  render: () => ({
    components: { Status, DeletedStatusTombstone },
    setup() {
      const a1 = createMockStatus({
        id: '1',
        account: createMockAccount({ displayName: 'Sarah Chen', username: 'sarah' }),
        content: '<p>What\'s your favorite Vue 3 feature?</p>',
      });
      const a3 = createMockStatus({
        id: '3',
        account: createMockAccount({ displayName: 'Jordan Lee', username: 'jordan' }),
        content: '<p>Agreed — script setup made the API so much cleaner.</p>',
      });
      return { a1, a3 };
    },
    template: `
      <div style="max-width: 600px">
        <Status :status="a1" :thread-position="{ kind: 'chain-start' }" :show-separator="false" />
        <DeletedStatusTombstone :thread-position="{ kind: 'chain-middle' }" reason="deleted" :show-separator="false" />
        <Status :status="a3" :thread-position="{ kind: 'chain-end' }" />
      </div>
    `,
  }),
};

export const TwoConsecutive: Story = {
  name: 'Two deleted in a row',
  parameters: {
    docs: {
      description: {
        story:
          'Edge case — two missing posts back-to-back. The rail should remain '
          + 'continuous without doubling up or visual artifacts.',
      },
    },
  },
  render: () => ({
    components: { Status, DeletedStatusTombstone },
    setup() {
      const a1 = createMockStatus({
        id: '1',
        account: createMockAccount({ displayName: 'Alice', username: 'alice' }),
        content: '<p>Starting a thread about CSS container queries.</p>',
      });
      const a4 = createMockStatus({
        id: '4',
        account: createMockAccount({ displayName: 'Maya', username: 'maya' }),
        content: '<p>The answer that survives the deletions.</p>',
      });
      return { a1, a4 };
    },
    template: `
      <div style="max-width: 600px">
        <Status :status="a1" :thread-position="{ kind: 'chain-start' }" :show-separator="false" />
        <DeletedStatusTombstone :thread-position="{ kind: 'chain-middle' }" reason="deleted" :show-separator="false" />
        <DeletedStatusTombstone :thread-position="{ kind: 'chain-middle' }" reason="unavailable" :show-separator="false" />
        <Status :status="a4" :thread-position="{ kind: 'chain-end' }" />
      </div>
    `,
  }),
};
