import type { Meta, StoryObj } from '@storybook/vue3';
import AverageRating from '@/components/ui/average-rating/AverageRating.vue';

const meta = {
  title: '13-Item/AverageRating',
  component: AverageRating,
  tags: ['autodocs'],
  args: {
    value: 4.1,
  },
} satisfies Meta<typeof AverageRating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Perfect: Story = {
  args: { value: 5.0 },
};

export const Low: Story = {
  args: { value: 1.2 },
};

export const Precise: Story = {
  args: { value: 3.75 },
};
