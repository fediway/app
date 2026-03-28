import type { Meta, StoryObj } from '@storybook/vue3';
import StatusStats from '@/components/status/StatusStats.vue';
import { wideDecorator } from '../decorators';

const meta = {
  title: '07-Status/StatusStats',
  component: StatusStats,
  tags: ['autodocs'],
  decorators: [wideDecorator],
} satisfies Meta<typeof StatusStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { reblogsCount: 15, favouritesCount: 42 },
};

export const OnlyReblogs: Story = {
  args: { reblogsCount: 15, favouritesCount: 0 },
};

export const OnlyLikes: Story = {
  args: { reblogsCount: 0, favouritesCount: 42 },
};

export const HighCounts: Story = {
  args: { reblogsCount: 15000, favouritesCount: 250000 },
};
