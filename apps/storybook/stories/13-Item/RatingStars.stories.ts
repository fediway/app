import type { Meta, StoryObj } from '@storybook/vue3';
import { RatingStars } from '@/components/ui/rating';

const meta = {
  title: '13-Item/RatingStars',
  component: RatingStars,
  tags: ['autodocs'],
} satisfies Meta<typeof RatingStars>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FiveStars: Story = {
  args: { value: 5 },
};

export const FourStars: Story = {
  args: { value: 4 },
};

export const OneStar: Story = {
  args: { value: 1 },
};

export const Zero: Story = {
  args: { value: 0 },
};
