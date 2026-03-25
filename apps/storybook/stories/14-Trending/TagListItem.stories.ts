import type { Meta, StoryObj } from '@storybook/vue3';
import TagListItem from '@/components/trending/TagListItem.vue';

const meta = {
  title: '14-Trending/TagListItem',
  component: TagListItem,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 400px"><story /></div>' })],
} satisfies Meta<typeof TagListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { name: 'photography', postCount: '2.4k' },
};

export const WithoutCount: Story = {
  args: { name: 'nature' },
};
