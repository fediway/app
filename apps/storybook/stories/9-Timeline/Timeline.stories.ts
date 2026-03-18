import type { Meta, StoryObj } from '@storybook/vue3';
import { Timeline } from '@/components/timeline';
import { createMockAccount, createMockStatus } from '../../mocks';

const meta = {
  title: '9-Timeline/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px; height: 600px;"><story /></div>' })],
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

const statuses = [
  createMockStatus({ content: '<p>Just discovered an amazing new open source project!</p>' }),
  createMockStatus({
    account: createMockAccount({ displayName: 'Sarah Chen', username: 'sarah' }),
    content: '<p>Beautiful sunset from my balcony today. Nature never disappoints.</p>',
  }),
  createMockStatus({
    account: createMockAccount({ displayName: 'Alex Rivera', username: 'alex' }),
    content: '<p>Working on a new side project with Vue 3 and Tailwind. The DX is incredible.</p>',
  }),
  createMockStatus({
    account: createMockAccount({ displayName: 'Jordan Kim', username: 'jordan' }),
    content: '<p>Hot take: RSS is still the best way to consume content online.</p>',
    favouritesCount: 156,
    reblogsCount: 42,
  }),
  createMockStatus({
    account: createMockAccount({ displayName: 'Morgan Lee', username: 'morgan' }),
    content: '<p>Just finished reading "Dune" for the third time. It gets better every read.</p>',
  }),
];

export const Default: Story = {
  args: { statuses },
};

export const Loading: Story = {
  args: { statuses: [], loading: true },
};

export const Empty: Story = {
  args: { statuses: [] },
};

export const WithLoadMore: Story = {
  args: { statuses, hasMore: true },
};
