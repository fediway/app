import type { Meta, StoryObj } from '@storybook/vue3';
import { NotificationList } from '@/components/notification';
import { createMockNotification } from '../../mocks';

const meta = {
  title: '10-Notification/NotificationList',
  component: NotificationList,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof NotificationList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    notifications: [
      createMockNotification('favourite'),
      createMockNotification('reblog'),
      createMockNotification('follow'),
      createMockNotification('mention'),
    ],
  },
};

export const Loading: Story = {
  args: { notifications: [], loading: true },
};

export const Empty: Story = {
  args: { notifications: [] },
};

export const Error: Story = {
  args: { notifications: [], error: 'Failed to load notifications' },
};
