import type { Meta, StoryObj } from '@storybook/vue3';
import ListHeader from '@/components/search-discover/ListHeader.vue';

const meta = {
  title: 'SearchDiscover/ListHeader',
  component: ListHeader,
  tags: ['autodocs'],
  argTypes: {
    showAction: { control: 'boolean' },
  },
  args: {
    title: 'User Suggestions',
    actionLabel: 'View all',
    showAction: true,
  },
} satisfies Meta<typeof ListHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Hallo Welt',
  },
};

export const NoAction: Story = {
  args: {
    showAction: false,
  },
};
