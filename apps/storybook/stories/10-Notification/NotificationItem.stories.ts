import type { Meta, StoryObj } from '@storybook/vue3';
import NotificationItem from '@/components/notification/NotificationItem.vue';
import { createMockNotification } from '../../mocks';

const meta = {
  title: '10-Notification/NotificationItem',
  component: NotificationItem,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof NotificationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Favourite: Story = {
  args: { notification: createMockNotification('favourite') },
};

export const Reblog: Story = {
  args: { notification: createMockNotification('reblog') },
};

export const Follow: Story = {
  args: { notification: createMockNotification('follow') },
};

export const Mention: Story = {
  args: { notification: createMockNotification('mention') },
};

export const Unread: Story = {
  args: {
    notification: createMockNotification('favourite'),
    unread: true,
  },
};

export const UnreadMention: Story = {
  args: {
    notification: createMockNotification('mention'),
    unread: true,
  },
};
