import type { Meta, StoryObj } from '@storybook/vue3';
import MessageBubble from '@/components/conversation/MessageBubble.vue';

const meta = {
  title: '11-Conversation/MessageBubble',
  component: MessageBubble,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 400px"><story /></div>' })],
} satisfies Meta<typeof MessageBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OwnMessage: Story = {
  args: {
    content: 'Hey, check out this new project!',
    isOwn: true,
    sentAt: new Date(Date.now() - 300000).toISOString(),
  },
};

export const OtherMessage: Story = {
  args: {
    content: 'That looks really great, thanks for sharing!',
    isOwn: false,
    sentAt: new Date(Date.now() - 600000).toISOString(),
  },
};

export const WithSharedStatus: Story = {
  args: {
    content: 'What do you think about this?',
    isOwn: true,
    sentAt: new Date(Date.now() - 120000).toISOString(),
    sharedStatus: {
      authorName: 'Alice Chen',
      authorAvatar: 'https://picsum.photos/seed/alice/200/200',
      content: 'Just shipped the new component library! Check it out.',
      imageUrl: 'https://picsum.photos/seed/shared/400/200',
    },
  },
};

export const WithFavourite: Story = {
  args: {
    content: 'Love this!',
    isOwn: true,
    sentAt: new Date(Date.now() - 60000).toISOString(),
    favourited: true,
  },
};
