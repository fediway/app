import type { Meta, StoryObj } from '@storybook/vue3';
import EmojiPickerButton from '@/components/compose/EmojiPickerButton.vue';

const meta = {
  title: '08-Compose/EmojiPickerButton',
  component: EmojiPickerButton,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="padding: 100px 24px 24px"><story /></div>' })],
} satisfies Meta<typeof EmojiPickerButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleEmoji = [
  { shortcode: 'blobcat', url: 'https://cdn.mastodon.social/emoji/blobcat.png', category: 'Blobs' },
  { shortcode: 'blobfox', url: 'https://cdn.mastodon.social/emoji/blobfox.png', category: 'Blobs' },
  { shortcode: 'blobheart', url: 'https://cdn.mastodon.social/emoji/blobheart.png', category: 'Blobs' },
  { shortcode: 'party_blob', url: 'https://cdn.mastodon.social/emoji/party_blob.png', category: 'Blobs' },
  { shortcode: 'fediverse', url: 'https://cdn.mastodon.social/emoji/fediverse.png', category: 'Fediverse' },
  { shortcode: 'mastodon', url: 'https://cdn.mastodon.social/emoji/mastodon.png', category: 'Fediverse' },
  { shortcode: 'verified', url: 'https://cdn.mastodon.social/emoji/verified.png', category: 'Status' },
  { shortcode: 'unverified', url: 'https://cdn.mastodon.social/emoji/unverified.png', category: 'Status' },
  { shortcode: 'fire', url: 'https://cdn.mastodon.social/emoji/fire.png', category: 'Reactions' },
  { shortcode: 'thumbsup', url: 'https://cdn.mastodon.social/emoji/thumbsup.png', category: 'Reactions' },
];

export const Default: Story = {
  args: { emoji: sampleEmoji },
};

export const Empty: Story = {
  args: { emoji: [] },
};

export const Disabled: Story = {
  args: { emoji: sampleEmoji, disabled: true },
};
