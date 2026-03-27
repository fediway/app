import type { Meta, StoryObj } from '@storybook/vue3';
import { PhBell, PhHouse, PhMagnifyingGlass, PhPlus, PhUser } from '@phosphor-icons/vue';
import { BottomNav } from '@/components/navigation';

const defaultItems = [
  { id: 'home', icon: PhHouse, label: 'Home', active: true },
  { id: 'search', icon: PhMagnifyingGlass, label: 'Search' },
  { id: 'new-post', icon: PhPlus, main: true },
  { id: 'notifications', icon: PhBell, label: 'Alerts' },
  { id: 'profile', icon: PhUser, label: 'Profile' },
];

const meta = {
  title: '05-Navigation/BottomNav',
  component: BottomNav,
  tags: ['autodocs'],
  args: {
    items: defaultItems,
  },
  render: args => ({
    components: { BottomNav },
    setup() {
      return { args };
    },
    template: '<div style="max-width: 420px"><BottomNav v-bind="args" /></div>',
  }),
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SearchActive: Story = {
  args: {
    items: [
      { id: 'home', icon: PhHouse, label: 'Home' },
      { id: 'search', icon: PhMagnifyingGlass, label: 'Search', active: true },
      { id: 'new-post', icon: PhPlus, main: true },
      { id: 'notifications', icon: PhBell, label: 'Alerts' },
      { id: 'profile', icon: PhUser, label: 'Profile' },
    ],
  },
};

export const DarkMode: Story = {
  render: args => ({
    components: { BottomNav },
    setup() {
      return { args };
    },
    template: `
      <div class="dark bg-gray-950 p-8" style="max-width: 420px">
        <BottomNav v-bind="args" />
      </div>
    `,
  }),
};

export const WithNotificationDot: Story = {
  args: {
    items: [
      { id: 'home', icon: PhHouse, label: 'Home', active: true },
      { id: 'search', icon: PhMagnifyingGlass, label: 'Search' },
      { id: 'new-post', icon: PhPlus, main: true },
      { id: 'notifications', icon: PhBell, label: 'Alerts', dot: true },
      { id: 'profile', icon: PhUser, label: 'Profile' },
    ],
  },
};

export const NoLabels: Story = {
  args: {
    items: [
      { id: 'home', icon: PhHouse, active: true },
      { id: 'search', icon: PhMagnifyingGlass },
      { id: 'new-post', icon: PhPlus, main: true },
      { id: 'notifications', icon: PhBell },
      { id: 'profile', icon: PhUser },
    ],
  },
};
