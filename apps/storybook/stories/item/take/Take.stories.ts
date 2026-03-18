import type { Meta, StoryObj } from '@storybook/vue3';
import Take from '@/components/item/take/Take.vue';

const meta = {
  title: 'Item/Take',
  component: Take,
  tags: ['autodocs'],
  args: {
    avatarSrc: 'https://picsum.photos/seed/alice/200/200',
    avatarAlt: 'Alice Chen',
    displayName: 'Alice Chen',
    rating: 5,
    timeAgo: '1 week ago',
    content: 'Highly recommend catching this on the big screen if you still can.',
    favouritesCount: 3,
    repliesCount: 4,
    reblogsCount: 1,
    favourited: false,
    replied: false,
    reblogged: false,
    bookmarked: false,
    visibility: 'public',
    showSeparator: true,
  },
  render: args => ({
    components: { Take },
    setup() {
      return { args };
    },
    template: `
      <div style="max-width: 390px">
        <Take v-bind="args" />
      </div>
    `,
  }),
} satisfies Meta<typeof Take>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FourStars: Story = {
  args: {
    displayName: 'Alle Wetter',
    avatarSrc: null,
    rating: 4,
    timeAgo: '2 days ago',
    content: 'Sehr gut!',
    favouritesCount: 1,
    repliesCount: 6,
    reblogsCount: 4,
  },
};

export const OneStarShort: Story = {
  args: {
    displayName: 'Hans Peter',
    avatarSrc: null,
    rating: 1,
    timeAgo: '1 week ago',
    content: 'I didn\'t watch it.',
    favouritesCount: 1,
    repliesCount: 6,
    reblogsCount: 4,
  },
};

export const LongReview: Story = {
  args: {
    displayName: 'Johann',
    avatarSrc: 'https://picsum.photos/seed/johann/200/200',
    rating: 5,
    timeAgo: '3 days ago',
    content: 'Denis Villeneuve actually did it. He took the back half of Frank Herbert\'s supposedly "unadaptable" 1965 sci-fi masterpiece and turned it into the most absolute, face-melting cinematic experience I\'ve seen in my lifetime.\n\nAs someone whose copy of Dune is held together by tape and pure willpower, I went into this theater holding my breath. I wanted to see if they could actually capture the true, terrifying essence of the Jihad and Paul\'s prescience without dumbing it down into a generic "chosen one" narrative. Spoiler alert: They didn\'t dumb it down. They nailed it.',
    favouritesCount: 1,
    repliesCount: 6,
    reblogsCount: 4,
  },
};

export const MultipleTakes: Story = {
  render: () => ({
    components: { Take },
    setup() {
      const takes = [
        {
          avatarSrc: 'https://picsum.photos/seed/alice/200/200',
          displayName: 'Alice Chen',
          rating: 5,
          timeAgo: '1 week ago',
          content: 'Highly recommend catching this on the big screen if you still can.',
          favouritesCount: 3,
          repliesCount: 4,
          reblogsCount: 1,
        },
        {
          avatarSrc: 'https://picsum.photos/seed/johann/200/200',
          displayName: 'Johann',
          rating: 5,
          timeAgo: '3 days ago',
          content: 'Denis Villeneuve actually did it. He took the back half of Frank Herbert\'s supposedly "unadaptable" 1965 sci-fi masterpiece and turned it into the most absolute, face-melting cinematic experience I\'ve seen in my lifetime.',
          favouritesCount: 1,
          repliesCount: 6,
          reblogsCount: 4,
        },
        {
          avatarSrc: null,
          displayName: 'Hans Peter',
          rating: 1,
          timeAgo: '1 week ago',
          content: 'I didn\'t watch it.',
          favouritesCount: 1,
          repliesCount: 6,
          reblogsCount: 4,
        },
        {
          avatarSrc: null,
          displayName: 'WisdomRain \u{1F98B}',
          rating: 5,
          timeAgo: '1 week ago',
          content: '',
          favouritesCount: 1,
          repliesCount: 6,
          reblogsCount: 4,
        },
      ];
      return { takes };
    },
    template: `
      <div style="max-width: 390px">
        <Take v-for="(take, i) in takes" :key="i" v-bind="take" />
      </div>
    `,
  }),
};

export const WithFavourited: Story = {
  args: {
    favourited: true,
    favouritesCount: 3,
  },
};

export const NoContent: Story = {
  args: {
    displayName: 'WisdomRain \u{1F98B}',
    avatarSrc: null,
    rating: 5,
    timeAgo: '1 week ago',
    content: '',
  },
};
