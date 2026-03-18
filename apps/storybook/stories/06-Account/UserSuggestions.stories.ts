import type { Meta, StoryObj } from '@storybook/vue3';
import UserSuggestions from '@/components/account/UserSuggestions.vue';

const mockUsers = [
  {
    displayName: 'Alice Chen',
    handle: '@alice.chen@mastodon.social',
    avatarSrc: 'https://picsum.photos/seed/alice/200/200',
  },
  {
    displayName: 'Bob Martinez',
    handle: '@bob.martinez@fosstodon.org',
    avatarSrc: 'https://picsum.photos/seed/bob/200/200',
  },
  {
    displayName: 'Clara Müller',
    handle: '@clara.mueller@chaos.social',
    avatarSrc: 'https://picsum.photos/seed/clara/200/200',
  },
];

const meta = {
  title: '06-Account/UserSuggestions',
  component: UserSuggestions,
  tags: ['autodocs'],
  args: {
    users: mockUsers,
  },
} satisfies Meta<typeof UserSuggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleUser: Story = {
  args: {
    users: [mockUsers[0]],
  },
};

export const NoAvatars: Story = {
  args: {
    users: mockUsers.map(u => ({ ...u, avatarSrc: null })),
  },
};

export const LongHandle: Story = {
  args: {
    users: [
      {
        displayName: 'Verylongusernamethatmightoverflow',
        handle: '@verylongusername@a-very-long-instance-domain-name.social',
        avatarSrc: 'https://picsum.photos/seed/long/200/200',
      },
    ],
  },
};
