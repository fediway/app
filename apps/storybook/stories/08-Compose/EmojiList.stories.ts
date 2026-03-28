import type { Meta, StoryObj } from '@storybook/vue3';
import EmojiList from '@/components/compose/EmojiList.vue';

const meta = {
  title: '08-Compose/EmojiList',
  component: EmojiList,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="padding: 24px"><story /></div>' })],
} satisfies Meta<typeof EmojiList>;

export default meta;
type Story = StoryObj<typeof meta>;

const customEmoji = [
  { shortcode: 'blobcat', url: 'https://cdn.mastodon.social/emoji/blobcat.png', category: 'Blobs' },
  { shortcode: 'blobfox', url: 'https://cdn.mastodon.social/emoji/blobfox.png', category: 'Blobs' },
  { shortcode: 'fediverse', url: 'https://cdn.mastodon.social/emoji/fediverse.png', category: 'Fediverse' },
  { shortcode: 'verified', url: 'https://cdn.mastodon.social/emoji/verified.png', category: 'Status' },
  { shortcode: 'party_blob', url: 'https://cdn.mastodon.social/emoji/party_blob.png', category: 'Blobs' },
];

export const WithSuggestions: Story = {
  args: { suggestions: customEmoji },
};

export const Loading: Story = {
  args: { suggestions: [], loading: true },
};

export const NoResults: Story = {
  args: { suggestions: [], loading: false },
};

export const SingleResult: Story = {
  args: { suggestions: [customEmoji[0]!] },
};
