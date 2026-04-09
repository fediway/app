import type { Meta, StoryObj } from '@storybook/vue3';
import NewPostsPill from '@/components/feed/NewPostsPill.vue';

const meta = {
  title: '09-Timeline/NewPostsPill',
  component: NewPostsPill,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 400px; display: flex; justify-content: center;"><story /></div>' })],
} satisfies Meta<typeof NewPostsPill>;

export default meta;
type Story = StoryObj<typeof meta>;

const avatars = [
  'https://picsum.photos/seed/np-alice/200/200',
  'https://picsum.photos/seed/np-bob/200/200',
  'https://picsum.photos/seed/np-carol/200/200',
];

export const SinglePost: Story = {
  args: {
    count: 1,
    avatars: [avatars[0]!],
  },
};

export const FewPosts: Story = {
  args: {
    count: 3,
    avatars: [avatars[0]!, avatars[1]!],
  },
};

export const ManyPosts: Story = {
  args: {
    count: 12,
    avatars,
  },
};

export const NoAvatars: Story = {
  args: {
    count: 5,
  },
};

export const OneAvatar: Story = {
  args: {
    count: 1,
    avatars: [avatars[0]!],
  },
};

export const TwoAvatars: Story = {
  args: {
    count: 4,
    avatars: [avatars[0]!, avatars[1]!],
  },
};

export const ThreeAvatars: Story = {
  args: {
    count: 8,
    avatars,
  },
};
