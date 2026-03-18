import type { Meta, StoryObj } from '@storybook/vue3';
import ListHeader from '@/components/ui/list-header/ListHeader.vue';

const meta = {
  title: '06-Account/ListHeader',
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
