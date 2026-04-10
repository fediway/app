import type { Meta, StoryObj } from '@storybook/vue3';
import type { EmojiSuggestion } from '@/components/compose/EmojiList.vue';
import CustomEmojiPicker from '@/components/compose/CustomEmojiPicker.vue';

const customEmoji: EmojiSuggestion[] = [
  { shortcode: 'blobcat', url: 'https://placehold.co/64x64/FFD700/000?text=🐱', category: 'Blobs' },
  { shortcode: 'blobfox', url: 'https://placehold.co/64x64/FF6347/fff?text=🦊', category: 'Blobs' },
  { shortcode: 'blobjoy', url: 'https://placehold.co/64x64/32CD32/fff?text=😄', category: 'Blobs' },
  { shortcode: 'blobwave', url: 'https://placehold.co/64x64/1E90FF/fff?text=👋', category: 'Blobs' },
  { shortcode: 'blobheart', url: 'https://placehold.co/64x64/FF69B4/fff?text=💖', category: 'Blobs' },
  { shortcode: 'blobthink', url: 'https://placehold.co/64x64/9370DB/fff?text=🤔', category: 'Blobs' },
  { shortcode: 'verified', url: 'https://placehold.co/64x64/1DA1F2/fff?text=✓', category: 'Badges' },
  { shortcode: 'fediverse', url: 'https://placehold.co/64x64/6364FF/fff?text=🌐', category: 'Badges' },
  { shortcode: 'mastodon', url: 'https://placehold.co/64x64/6364FF/fff?text=M', category: 'Badges' },
  { shortcode: 'fire', url: 'https://placehold.co/64x64/FF4500/fff?text=🔥', category: 'Reactions' },
  { shortcode: 'thumbsup', url: 'https://placehold.co/64x64/32CD32/fff?text=👍', category: 'Reactions' },
  { shortcode: 'party', url: 'https://placehold.co/64x64/FFD700/000?text=🎉', category: 'Reactions' },
  { shortcode: 'sparkles', url: 'https://placehold.co/64x64/DA70D6/fff?text=✨', category: 'Reactions' },
  { shortcode: '100', url: 'https://placehold.co/64x64/FF0000/fff?text=💯', category: 'Reactions' },
];

const meta = {
  title: '08-Compose/CustomEmojiPicker',
  component: CustomEmojiPicker,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="min-height: 400px; display: flex; align-items: end; justify-content: center; padding: 2rem;"><story /></div>' })],
} satisfies Meta<typeof CustomEmojiPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    emoji: customEmoji,
  },
};

export const Empty: Story = {
  args: {
    emoji: [],
  },
};

export const Disabled: Story = {
  args: {
    emoji: customEmoji,
    disabled: true,
  },
};

export const FewEmoji: Story = {
  args: {
    emoji: customEmoji.slice(0, 3),
  },
};

export const ManyEmoji: Story = {
  args: {
    emoji: [
      ...customEmoji,
      ...Array.from({ length: 40 }, (_, i) => ({
        shortcode: `custom_${i}`,
        url: `https://placehold.co/64x64/888/fff?text=${i}`,
        category: i < 20 ? 'Set A' : 'Set B',
      })),
    ],
  },
};
