import type { Meta, StoryObj } from '@storybook/vue3';
import { RichText } from '@/components/ui/rich-text';
import { wideDecorator } from '../decorators';

const meta = {
  title: '02-Primitives/RichText',
  component: RichText,
  tags: ['autodocs'],
  decorators: [wideDecorator],
} satisfies Meta<typeof RichText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { content: '<p>A simple paragraph of text about the fediverse.</p>' },
};

export const WithLinks: Story = {
  args: { content: '<p>Check out <a href="https://example.com" class="mention">this link</a> for more info.</p>' },
};

export const WithMentions: Story = {
  args: { content: '<p>Hey <span class="mention">@alice@mastodon.social</span>, great post!</p>' },
};

export const WithHashtags: Story = {
  args: { content: '<p>Just finished reading the best book this year <a href="/tags/BookReview" class="hashtag">#BookReview</a> <a href="/tags/Fantasy" class="hashtag">#Fantasy</a> <a href="/tags/SusannaClarke" class="hashtag">#SusannaClarke</a></p>' },
};

export const WithExternalLink: Story = {
  args: { content: '<p>Really interesting article about the fediverse: <a href="https://example.com/article">https://example.com/article</a></p>' },
};

export const AllDiscoveryElements: Story = {
  name: 'Mentions + Hashtags + Links',
  args: {
    content: '<p>Just finished <strong>Piranesi</strong> by <a href="https://books.social/@SusannaClarke" class="mention">@SusannaClarke</a>. The way she builds atmosphere through negative space is extraordinary.</p><p>Reminded me of <a href="https://books.social/@Borges" class="mention">@Borges</a> at his most labyrinthine. <a href="/tags/BookReview" class="hashtag">#BookReview</a> <a href="/tags/Fantasy" class="hashtag">#Fantasy</a></p><p>Full review: <a href="https://fediway.com/reviews/piranesi">https://fediway.com/reviews/piranesi</a></p>',
  },
};

export const Empty: Story = {
  args: { content: '' },
};
