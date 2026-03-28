import type { Meta, StoryObj } from '@storybook/vue3';
import { NavDrawerItem } from '@/components/navigation';
import { narrowDecorator } from '../decorators';

const meta = {
  title: '05-Navigation/NavDrawerItem',
  component: NavDrawerItem,
  tags: ['autodocs'],
  decorators: [narrowDecorator],
} satisfies Meta<typeof NavDrawerItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { icon: 'home', label: 'Home' },
};

export const Active: Story = {
  args: { icon: 'home', label: 'Home', active: true },
};

export const WithBadge: Story = {
  args: { icon: 'notifications', label: 'Notifications', badge: 12 },
};

export const WithDot: Story = {
  args: { icon: 'notifications', label: 'Notifications', dot: true },
};

export const AllItems: Story = {
  render: () => ({
    components: { NavDrawerItem },
    setup() {
      const items = [
        { icon: 'home', label: 'Home', active: true },
        { icon: 'explore', label: 'Explore' },
        { icon: 'notifications', label: 'Notifications', badge: 5 },
        { icon: 'chat', label: 'Messages', badge: 2 },
        { icon: 'favourites', label: 'Favourites' },
        { icon: 'saved', label: 'Saved' },
        { icon: 'profile', label: 'Profile' },
        { icon: 'settings', label: 'Settings' },
      ];
      return { items };
    },
    template: `
      <div class="flex flex-col">
        <NavDrawerItem
          v-for="item in items"
          :key="item.icon"
          v-bind="item"
        />
      </div>
    `,
  }),
};
