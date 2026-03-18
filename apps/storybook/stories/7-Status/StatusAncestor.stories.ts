import type { Meta, StoryObj } from '@storybook/vue3';
import StatusAncestor from '@/components/status/StatusAncestor.vue';
import { createMockStatus } from '../../mocks';

const meta = {
  title: '7-Status/StatusAncestor',
  component: StatusAncestor,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof StatusAncestor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { status: createMockStatus({ content: '<p>This is a parent post in a thread.</p>' }) },
};

export const WithConnector: Story = {
  args: {
    status: createMockStatus({ content: '<p>This post has a thread connector below it.</p>' }),
    showConnector: true,
  },
};

export const LongContent: Story = {
  args: {
    status: createMockStatus({
      content: `<p>${'This is a very long post that should demonstrate how the ancestor component handles overflow. '.repeat(5)}</p>`,
    }),
  },
};
