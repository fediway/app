import type { Meta, StoryObj } from '@storybook/vue3';
import { SideNavProfile } from '@/components/navigation';

const meta = {
  title: '05-Navigation/SideNavProfile',
  component: SideNavProfile,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="width: 240px"><story /></div>' })],
} satisfies Meta<typeof SideNavProfile>;

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
    handle: '@jane',
  },
};
