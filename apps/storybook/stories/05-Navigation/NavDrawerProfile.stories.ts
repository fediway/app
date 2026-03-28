import type { Meta, StoryObj } from '@storybook/vue3';
import { NavDrawerProfile } from '@/components/navigation';
import { narrowDecorator } from '../decorators';

const meta = {
  title: '05-Navigation/NavDrawerProfile',
  component: NavDrawerProfile,
  tags: ['autodocs'],
  decorators: [narrowDecorator],
} satisfies Meta<typeof NavDrawerProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    avatar: 'https://i.pravatar.cc/150?u=jane',
    name: 'Jane Doe',
    handle: '@jane@social.network',
  },
};

export const NoAvatar: Story = {
  args: {
    name: 'Jane Doe',
    handle: '@jane@social.network',
  },
};

export const LongName: Story = {
  args: {
    avatar: 'https://i.pravatar.cc/150?u=long',
    name: 'Alexandra Elizabeth Montgomery-Richardson III',
    handle: '@alexandra@very-long-instance-name.social',
  },
};
