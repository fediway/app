import type { Meta, StoryObj } from '@storybook/vue3';
import StatusReply from '@/components/status/StatusReply.vue';
import { createMockAccount, createMockStatus } from '../../mocks';

const meta = {
  title: '07-Status/StatusReply',
  component: StatusReply,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof StatusReply>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: createMockStatus({
      account: createMockAccount({ displayName: 'Bob Smith', username: 'bob' }),
      content: '<p>Great point! I completely agree with this take.</p>',
    }),
  },
};

export const WithHighCounts: Story = {
  args: {
    status: createMockStatus({
      content: '<p>This reply went viral somehow.</p>',
      repliesCount: 89,
      reblogsCount: 245,
      favouritesCount: 1200,
    }),
  },
};

export const LongContent: Story = {
  args: {
    status: createMockStatus({
      content: `<p>${'This is a detailed reply that goes on for quite a while and should test the layout. '.repeat(4)}</p>`,
    }),
  },
};
