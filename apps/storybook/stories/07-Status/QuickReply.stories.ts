import type { Meta, StoryObj } from '@storybook/vue3';
import { QuickReply } from '@/components/status';

const meta = {
  title: '07-Status/QuickReply',
  component: QuickReply,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
  argTypes: {
    onSubmit: { action: 'submit' },
    onExpand: { action: 'expand' },
  },
} satisfies Meta<typeof QuickReply>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    avatarSrc: 'https://placehold.co/96x96/E4A5BF/232B37?text=JD',
    avatarAlt: 'Jane Doe',
    replyToAcct: 'nixCraft',
  },
};

export const NoAvatar: Story = {
  args: {
    replyToAcct: 'sarah@mastodon.social',
  },
};

export const Disabled: Story = {
  args: {
    avatarSrc: 'https://placehold.co/96x96/E4A5BF/232B37?text=JD',
    replyToAcct: 'nixCraft',
    disabled: true,
  },
};

export const GenericPlaceholder: Story = {
  args: {
    avatarSrc: 'https://placehold.co/96x96/94AAC7/232B37?text=AC',
    avatarAlt: 'Alex Chen',
  },
};
