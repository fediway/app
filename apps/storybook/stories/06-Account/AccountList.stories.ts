import type { Meta, StoryObj } from '@storybook/vue3';
import AccountList from '@/components/account/AccountList.vue';
import { wideDecorator } from '../decorators';

const meta = {
  title: '06-Account/AccountList',
  component: AccountList,
  tags: ['autodocs'],
  decorators: [wideDecorator],
} satisfies Meta<typeof AccountList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    users: [
      { displayName: 'Alice Chen', handle: '@alice@mastodon.social', avatarSrc: 'https://picsum.photos/seed/alice/200/200' },
      { displayName: 'Sarah Chen', handle: '@sarah@mastodon.social', avatarSrc: 'https://picsum.photos/seed/sarah/200/200' },
      { displayName: 'Alex Rivera', handle: '@alex@fosstodon.org', avatarSrc: 'https://picsum.photos/seed/alex/200/200' },
    ],
  },
};

export const SingleUser: Story = {
  args: {
    users: [
      { displayName: 'Alice Chen', handle: '@alice@mastodon.social', avatarSrc: 'https://picsum.photos/seed/alice/200/200' },
    ],
  },
};

export const NoAvatars: Story = {
  args: {
    users: [
      { displayName: 'Alice Chen', handle: '@alice@mastodon.social' },
      { displayName: 'Bob Smith', handle: '@bob@mastodon.social' },
    ],
  },
};

export const LongHandles: Story = {
  args: {
    users: [
      { displayName: 'Alice', handle: '@alice@a-very-long-instance-domain.social', avatarSrc: 'https://picsum.photos/seed/alice/200/200' },
      { displayName: 'Verylongdisplaynamethatoverflows', handle: '@longname@mastodon.social', avatarSrc: 'https://picsum.photos/seed/long/200/200' },
    ],
  },
};
