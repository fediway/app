import type { Meta, StoryObj } from '@storybook/vue3';
import AvatarStack from '@/components/ui/avatar-stack/AvatarStack.vue';

const meta = {
  title: 'UI/AvatarStack',
  component: AvatarStack,
  tags: ['autodocs'],
  args: {
    avatars: [
      { initial: 'B' },
      { src: 'https://picsum.photos/seed/alice/200/200', alt: 'Alice' },
      { initial: 'T' },
    ],
    label: '3 takes from people you follow',
  },
} satisfies Meta<typeof AvatarStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AvatarsOnly: Story = {
  args: {
    avatars: [
      { src: 'https://picsum.photos/seed/a1/200/200' },
      { src: 'https://picsum.photos/seed/a2/200/200' },
      { src: 'https://picsum.photos/seed/a3/200/200' },
      { src: 'https://picsum.photos/seed/a4/200/200' },
    ],
    label: undefined,
  },
};

export const InitialsOnly: Story = {
  args: {
    avatars: [
      { initial: 'A' },
      { initial: 'B' },
      { initial: 'C' },
    ],
    label: undefined,
  },
};

export const SingleAvatar: Story = {
  args: {
    avatars: [{ src: 'https://picsum.photos/seed/solo/200/200', alt: 'Solo' }],
    label: '1 take from someone you follow',
  },
};

export const Overflow: Story = {
  args: {
    avatars: Array.from({ length: 20 }, (_, i) => ({
      src: `https://picsum.photos/seed/user${i}/200/200`,
    })),
    max: 5,
    label: '20 takes from people you follow',
  },
};

export const LargeOverflow: Story = {
  args: {
    avatars: Array.from({ length: 1000 }, (_, i) => ({
      initial: String.fromCodePoint(65 + (i % 26)),
    })),
    max: 3,
    label: '1,000 takes from people you follow',
  },
};
