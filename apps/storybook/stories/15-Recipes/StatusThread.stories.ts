import type { Meta, StoryObj } from '@storybook/vue3';
import { defineComponent } from 'vue';
import { StatusAncestor, StatusDetailMain, StatusReply } from '@/components/status';
import { createMockAccount, createMockStatus } from '../../mocks';

const StatusThread = defineComponent({
  name: 'StatusThread',
  components: { StatusAncestor, StatusDetailMain, StatusReply },
  setup() {
    const grandparent = createMockStatus({
      account: createMockAccount({ displayName: 'Alice Chen', username: 'alice' }),
      content: '<p>What are your thoughts on the new Mastodon features?</p>',
      repliesCount: 3,
    });

    const parent = createMockStatus({
      account: createMockAccount({ displayName: 'Sarah Chen', username: 'sarah' }),
      content: '<p>The quote posts feature is a game changer. Finally we can properly reference other posts without screenshot dunking.</p>',
      repliesCount: 2,
      favouritesCount: 15,
    });

    const main = createMockStatus({
      content: '<p>Completely agree. And the new notification grouping makes the timeline so much cleaner. I was drowning in individual like notifications before.</p>',
      favouritesCount: 42,
      reblogsCount: 8,
      repliesCount: 4,
    });

    const replies = [
      createMockStatus({
        account: createMockAccount({ displayName: 'Alex Rivera', username: 'alex' }),
        content: '<p>The grouped notifications are great but I wish we could customize which types get grouped.</p>',
        repliesCount: 1,
      }),
      createMockStatus({
        account: createMockAccount({ displayName: 'Jordan Kim', username: 'jordan' }),
        content: '<p>Has anyone tried the new edit history feature? Being able to see what changed in an edit is really useful for accountability.</p>',
        favouritesCount: 7,
      }),
    ];

    return { grandparent, parent, main, replies };
  },
  template: `
    <div style="max-width: 600px">
      <StatusAncestor :status="grandparent" show-connector />
      <StatusAncestor :status="parent" show-connector />
      <StatusDetailMain :status="main" />
      <StatusReply v-for="reply in replies" :key="reply.id" :status="reply" />
    </div>
  `,
});

const meta = {
  title: '15-Recipes/Status Thread',
  component: StatusThread,
  tags: ['autodocs'],
} satisfies Meta<typeof StatusThread>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
