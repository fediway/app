import type { Meta, StoryObj } from '@storybook/vue3';
import { PhBell } from '@phosphor-icons/vue';
import { EmptyState } from '@/components/ui/empty-state';
import { wideDecorator } from '../decorators';

const meta = {
  title: '04-Layout/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  decorators: [wideDecorator],
  argTypes: {
    title: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    actionLabel: {
      control: 'text',
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: 'No posts yet' },
};

export const WithDescription: Story = {
  args: {
    title: 'No notifications yet',
    description: 'When someone interacts with you, you\'ll see it here',
  },
};

export const WithAction: Story = {
  args: {
    title: 'No results found',
    description: 'Try a different search term',
    actionLabel: 'Clear search',
  },
};

export const WithIcon: Story = {
  args: {
    icon: PhBell,
    title: 'No notifications yet',
    description: 'When someone interacts with you, you\'ll see it here',
  },
};

export const AllFeatures: Story = {
  args: {
    icon: PhBell,
    title: 'No notifications yet',
    description: 'When someone interacts with you, you\'ll see it here',
    actionLabel: 'Explore',
  },
};
