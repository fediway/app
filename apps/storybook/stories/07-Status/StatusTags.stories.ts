import type { Meta, StoryObj } from '@storybook/vue3';
import { StatusTags } from '@/components/status';

const meta = {
  title: '07-Status/StatusTags',
  component: StatusTags,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof StatusTags>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tags: [
      { name: 'vue', url: 'https://mastodon.social/tags/vue', history: [] },
      { name: 'opensource', url: 'https://mastodon.social/tags/opensource', history: [] },
      { name: 'fediverse', url: 'https://mastodon.social/tags/fediverse', history: [] },
    ],
  },
};

export const ManyTags: Story = {
  args: {
    tags: Array.from({ length: 8 }, (_, i) => ({
      name: `tag${i + 1}`,
      url: `https://mastodon.social/tags/tag${i + 1}`,
      history: [],
    })),
  },
};

export const WithLimit: Story = {
  args: {
    tags: Array.from({ length: 8 }, (_, i) => ({
      name: `tag${i + 1}`,
      url: `https://mastodon.social/tags/tag${i + 1}`,
      history: [],
    })),
    limit: 3,
  },
};
