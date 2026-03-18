import type { Meta, StoryObj } from '@storybook/vue3';
import ReplyContext from '@/components/compose/ReplyContext.vue';

const meta = {
  title: '8-Compose/ReplyContext',
  component: ReplyContext,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof ReplyContext>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { acct: 'alice@mastodon.social' },
};
