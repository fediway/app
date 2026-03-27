import type { Meta, StoryObj } from '@storybook/vue3';
import { SideNavItem } from '@/components/navigation';

const meta = {
  title: '05-Navigation/SideNavItem',
  component: SideNavItem,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="width: 240px"><story /></div>' })],
} satisfies Meta<typeof SideNavItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { icon: 'home', label: 'Home' },
};

export const Active: Story = {
  args: { icon: 'notifications', label: 'Notifications', active: true },
};

export const WithBadge: Story = {
  args: { icon: 'notifications', label: 'Notifications', badge: 42 },
};

export const WithDot: Story = {
  args: { icon: 'notifications', label: 'Notifications', dot: true },
};
