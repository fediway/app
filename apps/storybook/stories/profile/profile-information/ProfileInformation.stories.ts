import type { Meta, StoryObj } from '@storybook/vue3';
import ProfileInformation from '@/components/profile/profile-information/ProfileInformation.vue';

const meta = {
  title: 'Profile/ProfileInformation',
  component: ProfileInformation,
  tags: ['autodocs'],
  args: {
    displayName: 'Alice Chen',
    handle: '@alice.chen@mastodon.social',
    bio: 'Living between espresso shots, full bookshelves, and indie cinema. Hosting you at my very own cafe in the heart of Berlin. Come over and let\'s chat about your favorite plot twists. ☕📖🎬',
    stats: [
      { count: 2341, label: 'Followers' },
      { count: 847, label: 'Following' },
      { count: 630, label: 'Posts' },
    ],
  },
} satisfies Meta<typeof ProfileInformation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoBio: Story = {
  args: {
    bio: null,
  },
};

export const NoStats: Story = {
  args: {
    stats: [],
  },
};

export const LongBio: Story = {
  args: {
    displayName: 'Verylongdisplaynamethatmightoverflow',
    handle: '@verylongusername@a-very-long-instance-domain-name.social',
    bio: 'This is a very long bio that goes on and on to test how the component handles lengthy text content. It includes multiple sentences and should wrap naturally within the container without breaking the layout.',
    stats: [
      { count: 123456, label: 'Followers' },
      { count: 98765, label: 'Following' },
      { count: 54321, label: 'Posts' },
    ],
  },
};

export const Minimal: Story = {
  args: {
    displayName: 'Bob',
    handle: '@bob@fosstodon.org',
    bio: null,
    stats: [],
  },
};
