import type { Meta, StoryObj } from '@storybook/vue3';
import ProfileHeader from '@/components/profile/ProfileHeader.vue';

const meta = {
  title: 'Profile/ProfileHeader',
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
  render: args => ({
    components: { ProfileHeader },
    setup: () => ({ args }),
    template: `
      <ProfileHeader v-bind="args">
        <template #badge>
          <span class="absolute right-4 bottom-0 translate-y-full mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            Follows you
          </span>
        </template>
      </ProfileHeader>
    `,
  }),
};
