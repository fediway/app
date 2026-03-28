import type { Meta, StoryObj } from '@storybook/vue3';
import ProfileInformation from '@/components/account/ProfileInformation.vue';
import { createMockAccount } from '../../mocks';
import { wideDecorator } from '../decorators';

const meta = {
  title: '06-Account/ProfileInformation',
  component: ProfileInformation,
  tags: ['autodocs'],
  decorators: [wideDecorator],
} satisfies Meta<typeof ProfileInformation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    account: createMockAccount({
      displayName: 'Alice Chen',
      note: '<p>Living between espresso shots, full bookshelves, and indie cinema. Hosting you at my very own cafe in the heart of Berlin.</p>',
      followersCount: 2341,
      followingCount: 847,
      statusesCount: 630,
    }),
  },
};

export const NoBio: Story = {
  args: {
    account: createMockAccount({ note: '' }),
  },
};

export const WithFields: Story = {
  args: {
    account: createMockAccount({
      displayName: 'Alice Chen',
      note: '<p>Developer & designer</p>',
      fields: [
        { name: 'Website', value: '<a href="https://alice.dev">alice.dev</a>', verifiedAt: '2024-01-15T00:00:00.000Z' },
        { name: 'Location', value: 'Berlin, Germany' },
      ],
    }),
  },
};

export const LongBio: Story = {
  args: {
    account: createMockAccount({
      displayName: 'Verylongdisplaynamethatmightoverflow',
      acct: 'verylongusername@a-very-long-instance-domain-name.social',
      note: '<p>This is a very long bio that goes on and on to test how the component handles lengthy text content. It includes multiple sentences and should wrap naturally within the container without breaking the layout.</p>',
      followersCount: 123456,
      followingCount: 98765,
      statusesCount: 54321,
    }),
  },
};

export const Minimal: Story = {
  args: {
    account: createMockAccount({
      displayName: 'Bob',
      note: '',
      followersCount: 0,
      followingCount: 0,
      statusesCount: 0,
      fields: [],
    }),
  },
};
