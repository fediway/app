import type { Meta, StoryObj } from '@storybook/vue3';
import { NotificationList } from '@/components/notification';
import { createMockAccount } from '../../mocks';
import { createMockNotification } from '../../mocks/notification';

const meta = {
  title: '10-Notification/NotificationList',
  component: NotificationList,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof NotificationList>;

export default meta;
type Story = StoryObj<typeof meta>;

const alice = createMockAccount({ displayName: 'Alice Chen', username: 'alice' });
const bob = createMockAccount({ displayName: 'Bob Smith', username: 'bob' });
const carol = createMockAccount({ displayName: 'Carol Davis', username: 'carol' });

export const Default: Story = {
  args: {
    notifications: [
      createMockNotification('favourite', { id: '100', account: alice }),
      createMockNotification('favourite', { id: '99', account: bob, status: undefined }),
      createMockNotification('reblog', { id: '98' }),
      createMockNotification('follow', { id: '97', account: carol }),
      createMockNotification('mention', { id: '96' }),
      createMockNotification('quote', { id: '95' }),
      createMockNotification('poll', { id: '94' }),
    ],
  },
};

export const GroupedLikes: Story = {
  name: 'Grouped — Multiple likes on same post',
  args: {
    notifications: (() => {
      const status = createMockNotification('favourite').status;
      return [
        createMockNotification('favourite', { id: '100', account: alice, status }),
        createMockNotification('favourite', { id: '99', account: bob, status }),
        createMockNotification('favourite', { id: '98', account: carol, status }),
        createMockNotification('follow', { id: '97' }),
        createMockNotification('mention', { id: '96' }),
      ];
    })(),
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

export const WithUnreadItems: Story = {
  args: {
    notifications: [
      createMockNotification('favourite', { id: '100' }),
      createMockNotification('reblog', { id: '99' }),
      createMockNotification('mention', { id: '98' }),
      createMockNotification('follow', { id: '50' }),
    ],
    lastReadId: '98',
  },
};

export const AllTypes: Story = {
  name: 'All notification types',
  args: {
    notifications: [
      createMockNotification('favourite', { id: '110' }),
      createMockNotification('reblog', { id: '109' }),
      createMockNotification('follow', { id: '108' }),
      createMockNotification('follow_request', { id: '107' }),
      createMockNotification('mention', { id: '106' }),
      createMockNotification('status', { id: '105' }),
      createMockNotification('poll', { id: '104' }),
      createMockNotification('update', { id: '103' }),
      createMockNotification('quote', { id: '102' }),
    ],
  },
};
