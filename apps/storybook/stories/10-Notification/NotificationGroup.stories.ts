import type { Meta, StoryObj } from '@storybook/vue3';
import NotificationGroup from '@/components/notification/NotificationGroup.vue';
import { createMockAttachment } from '../../mocks';
import { createMockNotificationGroup } from '../../mocks/notification';

const meta = {
  title: '10-Notification/NotificationGroup',
  component: NotificationGroup,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof NotificationGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleLike: Story = {
  args: { group: createMockNotificationGroup('favourite', 1) },
};

export const MultipleLikes: Story = {
  args: { group: createMockNotificationGroup('favourite', 3) },
};

export const ManyLikes: Story = {
  args: { group: createMockNotificationGroup('favourite', 8, { totalCount: 24 }) },
};

export const SingleRepost: Story = {
  args: { group: createMockNotificationGroup('reblog', 1) },
};

export const MultipleReposts: Story = {
  args: { group: createMockNotificationGroup('reblog', 4) },
};

export const Follow: Story = {
  args: { group: createMockNotificationGroup('follow', 1) },
};

export const FollowWithFollowBack: Story = {
  args: {
    group: createMockNotificationGroup('follow', 1),
    showFollowBack: true,
  },
};

export const MultipleFollows: Story = {
  args: { group: createMockNotificationGroup('follow', 5, { totalCount: 12 }) },
};

export const MultipleFollowsNoButton: Story = {
  name: 'Multiple Follows (no follow-back button)',
  args: {
    group: createMockNotificationGroup('follow', 3),
    showFollowBack: true,
  },
};

export const FollowRequest: Story = {
  args: { group: createMockNotificationGroup('follow_request', 1) },
};

export const MultipleFollowRequests: Story = {
  name: 'Multiple Follow Requests (no action buttons)',
  args: { group: createMockNotificationGroup('follow_request', 3) },
};

export const Mention: Story = {
  args: { group: createMockNotificationGroup('mention', 1) },
};

export const Status: Story = {
  args: { group: createMockNotificationGroup('status', 1) },
};

export const Poll: Story = {
  args: { group: createMockNotificationGroup('poll', 1) },
};

export const Update: Story = {
  args: { group: createMockNotificationGroup('update', 1) },
};

export const Quote: Story = {
  args: { group: createMockNotificationGroup('quote', 1) },
};

export const WithMedia: Story = {
  args: {
    group: createMockNotificationGroup('favourite', 2, {
      status: {
        id: 'media-status',
        content: '<p>Check out this beautiful sunset!</p>',
        mediaAttachments: [createMockAttachment({ type: 'image' })],
      } as any,
    }),
  },
};

export const UnreadSingleLike: Story = {
  args: {
    group: createMockNotificationGroup('favourite', 1),
    unread: true,
  },
};

export const UnreadGroupedLikes: Story = {
  args: {
    group: createMockNotificationGroup('favourite', 5, { totalCount: 15 }),
    unread: true,
  },
};

export const UnreadMention: Story = {
  args: {
    group: createMockNotificationGroup('mention', 1),
    unread: true,
  },
};

export const UnreadFollow: Story = {
  args: {
    group: createMockNotificationGroup('follow', 3),
    unread: true,
  },
};
