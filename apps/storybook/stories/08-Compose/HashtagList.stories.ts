import type { Meta, StoryObj } from '@storybook/vue3';
import HashtagList from '@/components/compose/HashtagList.vue';

const meta = {
  title: '08-Compose/HashtagList',
  component: HashtagList,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="padding: 24px"><story /></div>' })],
} satisfies Meta<typeof HashtagList>;

export default meta;
type Story = StoryObj<typeof meta>;

const suggestions = [
  { name: 'fediverse', postCount: 12450 },
  { name: 'fediwayapp', postCount: 342 },
  { name: 'federation', postCount: 8901 },
  { name: 'fedi', postCount: 5623 },
  { name: 'federated', postCount: 1204 },
];

export const WithSuggestions: Story = {
  args: { suggestions },
};

export const Loading: Story = {
  args: { suggestions: [], loading: true },
};

export const NoResults: Story = {
  args: { suggestions: [], loading: false },
};

export const WithoutCounts: Story = {
  args: {
    suggestions: [
      { name: 'newtag' },
      { name: 'testing' },
      { name: 'hello' },
    ],
  },
};
