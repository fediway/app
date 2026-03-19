import type { Meta, StoryObj } from '@storybook/vue3';
import ProfileHeader from '@/components/account/ProfileHeader.vue';

const meta = {
  title: '06-Account/ProfileHeader',
  component: ProfileHeader,
  tags: ['autodocs'],
  argTypes: {
    followsYou: { control: 'boolean' },
  },
  args: {
    headerImage: 'https://picsum.photos/seed/header/800/300',
    avatarSrc: 'https://picsum.photos/seed/avatar/200/200',
    avatarAlt: 'User avatar',
    followsYou: false,
  },
} satisfies Meta<typeof ProfileHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoHeaderImage: Story = {
  args: {
    headerImage: null,
  },
};

export const NoAvatar: Story = {
  args: {
    avatarSrc: null,
  },
};

export const FollowsYou: Story = {
  args: {
    followsYou: true,
  },
};
