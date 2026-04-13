import type { Meta, StoryObj } from '@storybook/vue3';
import Status from '@/components/status/Status.vue';
import ThreadCollapseNode from '@/components/status/ThreadCollapseNode.vue';
import { createMockAccount, createMockStatus } from '../../mocks';
import { wideDecorator } from '../decorators';

const sarah = createMockAccount({ id: 's', displayName: 'Sarah Chen', username: 'sarah' });
const alex = createMockAccount({ id: 'a', displayName: 'Alex Kim', username: 'alex' });
const jordan = createMockAccount({ id: 'j', displayName: 'Jordan Lee', username: 'jordan' });
const maya = createMockAccount({ id: 'm', displayName: 'Maya Patel', username: 'maya' });

const meta = {
  title: '07-Status/ThreadCollapseNode',
  component: ThreadCollapseNode,
  tags: ['autodocs'],
  decorators: [wideDecorator],
  parameters: {
    docs: {
      description: {
        component:
          '"Show N more replies" expand control with up to 3 overlapping '
          + 'avatars showing who replied. Used when a chain exceeds the depth '
          + 'threshold or when wide branches collapse. Sits on the rail like '
          + 'any other thread row — rail flows through.',
      },
    },
  },
} satisfies Meta<typeof ThreadCollapseNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OneAvatar: Story = {
  name: '1 avatar — single hidden reply',
  args: {
    threadPosition: { kind: 'chain-middle' },
    accounts: [sarah],
    hiddenCount: 1,
    showSeparator: false,
  },
};

export const TwoAvatars: Story = {
  name: '2 avatars',
  args: {
    threadPosition: { kind: 'chain-middle' },
    accounts: [sarah, alex],
    hiddenCount: 5,
    showSeparator: false,
  },
};

export const ThreeAvatars: Story = {
  name: '3 avatars — typical case',
  args: {
    threadPosition: { kind: 'chain-middle' },
    accounts: [sarah, alex, jordan],
    hiddenCount: 12,
    showSeparator: false,
  },
};

export const LargeCount: Story = {
  name: 'Large count (3 avatars + 47 hidden)',
  args: {
    threadPosition: { kind: 'chain-middle' },
    accounts: [sarah, alex, jordan, maya],
    hiddenCount: 47,
    showSeparator: false,
  },
};

export const Standalone: Story = {
  name: 'Standalone (no rails)',
  args: {
    threadPosition: { kind: 'standalone' },
    accounts: [sarah, alex, jordan],
    hiddenCount: 8,
  },
};

export const InsideChain: Story = {
  name: 'Realistic — collapse inside a reply chain',
  parameters: {
    docs: {
      description: {
        story:
          'The collapse node replaces a deep stretch of replies. Rail flows '
          + 'through it from the post above to the post below.',
      },
    },
  },
  render: () => ({
    components: { Status, ThreadCollapseNode },
    setup() {
      const a1 = createMockStatus({
        id: '1',
        account: sarah,
        content: '<p>Hot take: Tailwind is the future of CSS.</p>',
      });
      const a2 = createMockStatus({
        id: '2',
        account: alex,
        content: '<p>Hard agree. Once you internalize the utilities, going back to BEM feels like writing assembly.</p>',
      });
      const a6 = createMockStatus({
        id: '6',
        account: maya,
        content: '<p>The deepest part of the chain — buried under collapsed replies.</p>',
      });
      return { a1, a2, a6, accounts: [jordan, alex, sarah] };
    },
    template: `
      <div style="max-width: 600px">
        <Status :status="a1" :thread-position="{ kind: 'chain-start' }" :show-separator="false" />
        <Status :status="a2" :thread-position="{ kind: 'chain-middle' }" :show-separator="false" />
        <ThreadCollapseNode
          :thread-position="{ kind: 'chain-middle' }"
          :accounts="accounts"
          :hidden-count="14"
          :show-separator="false"
        />
        <Status :status="a6" :thread-position="{ kind: 'chain-end' }" />
      </div>
    `,
  }),
};
