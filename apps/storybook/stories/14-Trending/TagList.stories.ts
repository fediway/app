import type { Meta, StoryObj } from '@storybook/vue3';
import { TagList } from '@/components/trending';

const meta = {
  title: '14-Trending/TagList',
  component: TagList,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 400px"><story /></div>' })],
} satisfies Meta<typeof TagList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tags: [
      { name: 'photography', postCount: '2.4k' },
      { name: 'nature', postCount: '1.8k' },
      { name: 'coding', postCount: '1.5k' },
      { name: 'travel', postCount: '1.2k' },
      { name: 'music', postCount: '870' },
    ],
  },
};

export const Loading: Story = {
  args: { tags: [], loading: true },
};

export const Empty: Story = {
  args: { tags: [] },
};
