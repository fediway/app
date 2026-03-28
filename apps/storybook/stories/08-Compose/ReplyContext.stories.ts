import type { Meta, StoryObj } from '@storybook/vue3';
import ReplyContext from '@/components/compose/ReplyContext.vue';
import { wideDecorator } from '../decorators';

const meta = {
  title: '08-Compose/ReplyContext',
  component: ReplyContext,
  tags: ['autodocs'],
  decorators: [wideDecorator],
} satisfies Meta<typeof ReplyContext>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { acct: 'alice@mastodon.social' },
};

export const ShortHandle: Story = {
  args: { acct: 'alice' },
};

export const LongHandle: Story = {
  args: { acct: 'alice_wonderland@very-long-instance-name.example.org' },
};
