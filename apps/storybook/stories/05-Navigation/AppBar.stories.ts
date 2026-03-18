import type { Meta, StoryObj } from '@storybook/vue3';
import { AppBar } from '@/components/navigation';

const meta = {
  title: '05-Navigation/AppBar',
  component: AppBar,
  tags: ['autodocs'],
  args: {
    title: 'Home',
    leftIcon: 'menu',
    leftLabel: 'Open menu',
    rightIcon: 'explore',
    rightLabel: 'Explore',
  },
} satisfies Meta<typeof AppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BackButton: Story = {
  args: {
    title: 'Thread',
    leftIcon: 'back',
    leftLabel: 'Go back',
    rightIcon: 'explore',
    rightLabel: 'Explore',
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Settings',
    leftIcon: undefined,
    rightIcon: undefined,
  },
};

export const NoBorder: Story = {
  args: {
    title: 'Profile',
    leftIcon: 'back',
    leftLabel: 'Go back',
    bordered: false,
  },
};

export const DarkMode: Story = {
  render: args => ({
    components: { AppBar },
    setup() {
      return { args };
    },
    template: `
      <div class="dark bg-gray-950">
        <AppBar v-bind="args" />
      </div>
    `,
  }),
  args: {
    title: 'Notifications',
    leftIcon: 'menu',
    leftLabel: 'Open menu',
    rightIcon: 'explore',
    rightLabel: 'Explore',
  },
};
