import type { Meta, StoryObj } from '@storybook/vue3';
import StatusSkeleton from '@/components/status/StatusSkeleton.vue';
import ThreadSkeleton from '@/components/status/ThreadSkeleton.vue';
import { wideDecorator } from '../decorators';

const meta = {
  title: '07-Status/ThreadSkeleton',
  component: ThreadSkeleton,
  tags: ['autodocs'],
  decorators: [wideDecorator],
  parameters: {
    docs: {
      description: {
        component:
          'Thread-shaped loading skeleton. Renders `StatusSkeleton` rows with '
          + 'the correct rail topology so the layout doesn\'t shift when real '
          + 'content arrives. Default: 1 ancestor + main + 3 descendants.',
      },
    },
  },
} satisfies Meta<typeof ThreadSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const NoAncestors: Story = {
  args: { ancestors: 0, descendants: 4 },
};

export const NoDescendants: Story = {
  args: { ancestors: 2, descendants: 0 },
};

export const LongThread: Story = {
  args: { ancestors: 3, descendants: 6 },
};

export const SingleSkeletonRow: Story = {
  name: 'StatusSkeleton — standalone',
  render: () => ({
    components: { StatusSkeleton },
    template: `
      <div style="max-width: 600px">
        <StatusSkeleton />
      </div>
    `,
  }),
};

export const SingleSkeletonInChain: Story = {
  name: 'StatusSkeleton — chain-middle (rail above + below)',
  render: () => ({
    components: { StatusSkeleton },
    template: `
      <div style="max-width: 600px">
        <StatusSkeleton :thread-position="{ kind: 'chain-start' }" :show-separator="false" />
        <StatusSkeleton :thread-position="{ kind: 'chain-middle' }" :show-separator="false" />
        <StatusSkeleton :thread-position="{ kind: 'chain-end' }" />
      </div>
    `,
  }),
};
