import type { Meta, StoryObj } from '@storybook/vue3';
import { StatusActions } from '@/components/status';

const meta = {
  title: '7-Status/StatusActions',
  component: StatusActions,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof StatusActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    repliesCount: 3,
    reblogsCount: 15,
    favouritesCount: 42,
    favourited: false,
    reblogged: false,
    bookmarked: false,
    visibility: 'public',
  },
};

export const AllActive: Story = {
  args: {
    repliesCount: 3,
    reblogsCount: 15,
    favouritesCount: 42,
    favourited: true,
    reblogged: true,
    bookmarked: true,
    visibility: 'public',
  },
};

export const DirectMessage: Story = {
  args: {
    repliesCount: 1,
    reblogsCount: 0,
    favouritesCount: 2,
    favourited: false,
    reblogged: false,
    bookmarked: false,
    visibility: 'direct',
  },
};

export const ZeroCounts: Story = {
  args: {
    repliesCount: 0,
    reblogsCount: 0,
    favouritesCount: 0,
    favourited: false,
    reblogged: false,
    bookmarked: false,
    visibility: 'public',
  },
};
