import type { Meta, StoryObj } from '@storybook/vue3';
import FeedItem from '@/components/status/Status.vue';

const meta = {
  title: '07-Status/FeedItem',
  component: FeedItem,
  tags: ['autodocs'],
  argTypes: {
    visibility: { control: 'select', options: ['public', 'unlisted', 'private', 'direct'] },
  },
  args: {
    avatarSrc: 'https://picsum.photos/seed/alice/200/200',
    avatarAlt: 'Alice Chen',
    displayName: 'Alice Chen',
    handle: '@alice.chen@mastodon.social',
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    favouritesCount: 1,
    repliesCount: 6,
    reblogsCount: 4,
    favourited: false,
    replied: false,
    reblogged: false,
    bookmarked: false,
    visibility: 'public',
    showSeparator: true,
  },
  render: args => ({
    components: { FeedItem },
    setup() {
      return { args };
    },
    template: `
      <div style="max-width: 600px">
        <FeedItem v-bind="args">
          <p class="text-foreground">{{ args.default || 'Just watched Everything Everywhere All at Once. Absolutely mind-blowing — the way it weaves multiverse chaos into a deeply personal family story is unlike anything I\\'ve seen.' }}</p>
        </FeedItem>
      </div>
    `,
  }),
} satisfies Meta<typeof FeedItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithImage: Story = {
  render: args => ({
    components: { FeedItem },
    setup() {
      return { args };
    },
    template: `
      <div style="max-width: 600px">
        <FeedItem v-bind="args">
          <p class="text-foreground">Golden hour at the coast today</p>
          <img
            src="https://picsum.photos/seed/coast/600/400"
            alt="Coast at golden hour"
            class="mt-2 rounded-xl border border-border w-full object-cover max-h-80"
          />
        </FeedItem>
      </div>
    `,
  }),
  args: {
    displayName: 'Maya Rodriguez',
    handle: '@maya@photography.social',
    avatarSrc: 'https://picsum.photos/seed/maya/200/200',
    favouritesCount: 24,
    repliesCount: 3,
    reblogsCount: 8,
  },
};

export const WithItemCard: Story = {
  render: args => ({
    components: { FeedItem },
    setup() {
      return { args };
    },
    template: `
      <div style="max-width: 600px">
        <FeedItem v-bind="args">
          <p class="text-foreground">Finally got around to this one. Deserves every bit of the hype.</p>
          <div class="mt-2 flex items-center gap-2 rounded-lg border border-border p-3">
            <img src="https://picsum.photos/seed/movie-eeaao/80/120" class="w-12 h-18 rounded object-cover" />
            <div>
              <div class="font-medium text-foreground text-sm">Everything Everywhere All at Once</div>
              <div class="text-foreground/60 text-xs">Daniel Kwan, Daniel Scheinert · 2022</div>
              <div class="mt-1 text-yellow-500">★★★★★</div>
            </div>
          </div>
        </FeedItem>
      </div>
    `,
  }),
  args: {
    favouritesCount: 12,
    repliesCount: 2,
    reblogsCount: 5,
  },
};

export const ReplyThread: Story = {
  render: () => ({
    components: { FeedItem },
    setup() {
      const context = {
        avatarSrc: 'https://picsum.photos/seed/johann/200/200',
        displayName: 'Johann',
        handle: '@berlin_reader@mastodon.social',
        createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
        hasReplyBelow: true,
        hideActions: true,
        showSeparator: false,
      };
      const reply = {
        avatarSrc: 'https://picsum.photos/seed/alice/200/200',
        displayName: 'Alice Chen',
        handle: '@alice.chen@mastodon.social',
        createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
        favouritesCount: 7,
        repliesCount: 4,
        reblogsCount: 0,
        bookmarked: true,
      };
      return { context, reply };
    },
    template: `
      <div style="max-width: 600px">
        <FeedItem v-bind="context">
          <p class="text-foreground"><span class="font-semibold">@alice.chen@mastodon.social</span> I need a good book recommendation! I am in a massive reading slump. Also, your oat milk flat whites literally saved my week.</p>
        </FeedItem>
        <FeedItem v-bind="reply">
          <p class="text-foreground">Thank you so much! Try 'Dark Matter' by Blake Crouch. It is a fast-paced sci-fi thriller that does not let you go after page one. Let me know what you think when you come in again!</p>
        </FeedItem>
      </div>
    `,
  }),
};

export const AllActionsActive: Story = {
  args: {
    favourited: true,
    replied: true,
    reblogged: true,
    bookmarked: true,
    favouritesCount: 42,
    repliesCount: 18,
    reblogsCount: 7,
  },
};

export const LongContent: Story = {
  render: args => ({
    components: { FeedItem },
    setup() {
      return { args };
    },
    template: `
      <div style="max-width: 600px">
        <FeedItem v-bind="args">
          <p class="text-foreground">
            I've been thinking a lot about how we consume media these days. There's something beautiful about
            taking the time to really sit with a film, an album, or a book — not just consuming it, but letting
            it change you. We scroll through endless recommendations and hot takes, but how often do we actually
            stop and reflect on what something meant to us? I think that's what makes logging and rating so
            valuable — it forces you to articulate your experience, even if it's just a star count. That tiny
            act of reflection transforms passive consumption into active engagement with culture.
          </p>
        </FeedItem>
      </div>
    `,
  }),
  args: {
    displayName: 'Alexandria Konstantinidis-Weatherington',
    handle: '@alexandria.konstantinidis@very-long-instance-name.social',
    favouritesCount: 156,
    repliesCount: 43,
    reblogsCount: 89,
  },
};
