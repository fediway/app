import type { Meta, StoryObj } from '@storybook/vue3';
import FollowButton from '@/components/account/FollowButton.vue';

const meta = {
  title: '6-Account/FollowButton',
  component: FollowButton,
  tags: ['autodocs'],
} satisfies Meta<typeof FollowButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { isFollowing: false },
};

export const Following: Story = {
  args: { isFollowing: true },
};

export const Loading: Story = {
  args: { isFollowing: false, loading: true },
};
