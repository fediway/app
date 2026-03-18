import type { Meta, StoryObj } from '@storybook/vue3';
import { RichText } from '@/components/primitives';

const meta = {
  title: '02-Primitives/RichText',
  component: RichText,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
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

export const Empty: Story = {
  args: { content: '' },
};
