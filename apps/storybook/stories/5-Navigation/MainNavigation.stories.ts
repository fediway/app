import type { Meta, StoryObj } from '@storybook/vue3';
import { PhHouse, PhMagnifyingGlass, PhPlus, PhStar, PhUser } from '@phosphor-icons/vue';
import { MainNavigation } from '@/components/navigation';

const defaultItems = [
  { icon: PhHouse, label: 'Home', href: '/' },
  { icon: PhMagnifyingGlass, label: 'Search', href: '/search' },
  { icon: PhPlus, main: true, href: '/new' },
  { icon: PhStar, label: 'Activity', href: '/activity' },
  { icon: PhUser, label: 'Profile', href: '/profile' },
];

const meta = {
  title: '5-Navigation/MainNavigation',
  component: MainNavigation,
  tags: ['autodocs'],
  args: {
    items: defaultItems,
  },
  render: args => ({
    components: { MainNavigation },
    setup() {
      return { args };
    },
    template: '<div style="max-width: 420px"><MainNavigation v-bind="args" /></div>',
  }),
} satisfies Meta<typeof MainNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HomeActive: Story = {
  args: {
    items: [
      { icon: PhHouse, label: 'Home', href: '/', active: true },
      { icon: PhMagnifyingGlass, label: 'Search', href: '/search' },
      { icon: PhPlus, main: true, href: '/new' },
      { icon: PhStar, label: 'Activity', href: '/activity' },
      { icon: PhUser, label: 'Profile', href: '/profile' },
    ],
  },
};
