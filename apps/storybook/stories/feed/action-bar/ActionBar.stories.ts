import type { Meta, StoryObj } from '@storybook/vue3';
import ActionBar from '@/components/feed/action-bar/ActionBar.vue';

const meta = {
  title: 'Feed/ActionBar',
  component: ActionBar,
  tags: ['autodocs'],
  argTypes: {
    visibility: { control: 'select', options: ['public', 'unlisted', 'private', 'direct'] },
    favourited: { control: 'boolean' },
    replied: { control: 'boolean' },
    reblogged: { control: 'boolean' },
    bookmarked: { control: 'boolean' },
  },
  args: {
    repliesCount: 6,
    reblogsCount: 4,
    favouritesCount: 1,
    favourited: false,
    replied: false,
    reblogged: false,
    bookmarked: false,
    visibility: 'public',
  },
} satisfies Meta<typeof ActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllActive: Story = {
  args: {
    favourited: true,
    replied: true,
    reblogged: true,
    bookmarked: true,
  },
};

export const NoCounts: Story = {
  args: {
    repliesCount: 0,
    reblogsCount: 0,
    favouritesCount: 0,
  },
};

export const PrivatePost: Story = {
  args: {
    visibility: 'private',
  },
};
