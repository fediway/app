import type { Meta, StoryObj } from '@storybook/vue3';
import { defineComponent } from 'vue';
import ProfileActions from '@/components/account/ProfileActions.vue';
import ProfileHeader from '@/components/account/ProfileHeader.vue';
import ProfileInformation from '@/components/account/ProfileInformation.vue';
import { createMockAccount } from '../../mocks';

const ProfilePage = defineComponent({
  name: 'ProfilePage',
  components: { ProfileHeader, ProfileInformation, ProfileActions },
  setup() {
    const account = createMockAccount({
      displayName: 'Alice Chen',
      username: 'alice',
      acct: 'alice@mastodon.social',
      note: '<p>Software developer & open source enthusiast. Building on the fediverse. Previously at Stripe. Coffee addict.</p>',
      followersCount: 2341,
      followingCount: 847,
      statusesCount: 630,
      fields: [
        { name: 'Website', value: '<a href="https://alice.dev">alice.dev</a>', verifiedAt: '2024-01-15T00:00:00.000Z' },
        { name: 'Location', value: 'Berlin, Germany' },
      ],
    });

    return { account };
  },
  template: `
    <div style="max-width: 600px">
      <ProfileHeader
        :header-image="account.header"
        :avatar-src="account.avatar"
        :avatar-alt="account.displayName"
        follows-you
      />

      <div class="px-5 -mt-3 flex justify-end">
        <ProfileActions :following="false" />
      </div>

      <div class="mt-3">
        <ProfileInformation :account="account" />
      </div>
    </div>
  `,
});

const meta = {
  title: '15-Recipes/Profile Page',
  component: ProfilePage,
  tags: ['autodocs'],
} satisfies Meta<typeof ProfilePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
