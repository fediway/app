import type { Meta, StoryObj } from '@storybook/vue3';
import MentionList from '@/components/compose/MentionList.vue';

const meta = {
  title: '08-Compose/MentionList',
  component: MentionList,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="padding: 24px"><story /></div>' })],
} satisfies Meta<typeof MentionList>;

export default meta;
type Story = StoryObj<typeof meta>;

const suggestions = [
  { id: 'alice@mastodon.social', acct: 'alice@mastodon.social', displayName: 'Alice Johnson', avatar: 'https://i.pravatar.cc/80?u=alice' },
  { id: 'bob@fosstodon.org', acct: 'bob@fosstodon.org', displayName: 'Bob Smith', avatar: 'https://i.pravatar.cc/80?u=bob' },
  { id: 'carol@hachyderm.io', acct: 'carol@hachyderm.io', displayName: 'Carol Williams', avatar: 'https://i.pravatar.cc/80?u=carol' },
  { id: 'dave@infosec.exchange', acct: 'dave@infosec.exchange', displayName: 'Dave Chen', avatar: 'https://i.pravatar.cc/80?u=dave' },
  { id: 'eve@tech.lgbt', acct: 'eve@tech.lgbt', displayName: 'Eve Martinez', avatar: 'https://i.pravatar.cc/80?u=eve' },
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

export const SingleResult: Story = {
  args: { suggestions: [suggestions[0]!] },
};
