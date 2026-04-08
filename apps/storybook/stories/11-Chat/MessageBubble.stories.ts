import type { Meta, StoryObj } from '@storybook/vue3';
import MessageBubble from '@/components/chat/MessageBubble.vue';

function mockImage(id: string, seed: string) {
  return {
    id,
    type: 'image' as const,
    url: `https://picsum.photos/seed/${seed}/600/400`,
    previewUrl: `https://picsum.photos/seed/${seed}/600/400`,
    description: '',
    meta: null,
    blurhash: null,
    remoteUrl: null,
    textUrl: null,
  };
}

const meta = {
  title: '11-Chat/MessageBubble',
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

export const WithImage: Story = {
  args: {
    content: 'Look at this view!',
    isOwn: true,
    sentAt: new Date(Date.now() - 90000).toISOString(),
    mediaAttachments: [mockImage('1', 'chat1')] as any,
  },
};

export const TwoImages: Story = {
  args: {
    isOwn: false,
    sentAt: new Date(Date.now() - 45000).toISOString(),
    mediaAttachments: [mockImage('1', 'pair-a'), mockImage('2', 'pair-b')] as any,
  },
};

export const ThreeImages: Story = {
  args: {
    content: 'From the trip!',
    isOwn: true,
    sentAt: new Date(Date.now() - 40000).toISOString(),
    mediaAttachments: [
      mockImage('1', 'trip-a'),
      mockImage('2', 'trip-b'),
      mockImage('3', 'trip-c'),
    ] as any,
  },
};

export const FourImages: Story = {
  args: {
    isOwn: false,
    sentAt: new Date(Date.now() - 35000).toISOString(),
    mediaAttachments: [
      mockImage('1', 'grid-a'),
      mockImage('2', 'grid-b'),
      mockImage('3', 'grid-c'),
      mockImage('4', 'grid-d'),
    ] as any,
  },
};

export const WithLinkCard: Story = {
  args: {
    content: 'Have you seen this?',
    isOwn: false,
    sentAt: new Date(Date.now() - 30000).toISOString(),
    card: {
      url: 'https://example.com/article',
      title: 'Building a Worldclass Social Client',
      description: 'How we designed Fediway from the ground up.',
      image: 'https://picsum.photos/seed/card/600/315',
      type: 'link',
    } as any,
  },
};

export const WithLinkCardNoImage: Story = {
  args: {
    content: 'This is a good read',
    isOwn: true,
    sentAt: new Date(Date.now() - 20000).toISOString(),
    card: {
      url: 'https://example.com/notes',
      title: 'Design Notes on Chat Interfaces',
      description: 'Lessons from building messaging UIs.',
      type: 'link',
    } as any,
  },
};

export const GroupChatWithSender: Story = {
  args: {
    content: 'Has anyone tried the new API yet?',
    isOwn: false,
    sentAt: new Date(Date.now() - 15000).toISOString(),
    senderName: 'Alex Chen',
    senderAvatar: 'https://picsum.photos/seed/alex/200/200',
    showSender: true,
  },
};

export const GroupChatConsecutive: Story = {
  args: {
    content: 'I think it looks promising',
    isOwn: false,
    sentAt: new Date(Date.now() - 10000).toISOString(),
    senderName: 'Alex Chen',
    senderAvatar: 'https://picsum.photos/seed/alex/200/200',
    showSender: false,
  },
};
