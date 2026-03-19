import type { Item } from '@repo/types';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ItemCard } from '@/components/item';

const movieItem: Item = {
  url: 'https://example.com/movie/eeaao',
  type: 'movie',
  title: 'Everything Everywhere All at Once',
  director: 'Daniel Kwan, Daniel Scheinert',
  year: 2022,
  image: 'https://picsum.photos/seed/movie-eeaao/200/300',
};

const songItem: Item = {
  url: 'https://example.com/album/hounds-of-love',
  type: 'song',
  title: 'Hounds of Love',
  artist: 'Kate Bush',
  year: 1985,
  image: 'https://picsum.photos/seed/album-hounds/300/300',
};

const bookItem: Item = {
  url: 'https://example.com/book/dune',
  type: 'book',
  title: 'Dune',
  author: 'Frank Herbert',
  year: 1965,
};

const linkItem: Item = {
  url: 'https://www.nytimes.com/2025/03/15/technology/fediverse-growth.html',
  type: 'link',
  title: 'The Fediverse Is Growing Fast. Here\'s What You Need to Know.',
  description: 'As more people leave centralized platforms, decentralized social networks are seeing unprecedented growth.',
  provider: 'The New York Times',
  author: 'Sarah Chen',
  image: 'https://picsum.photos/seed/nyt-article/400/200',
  language: 'en',
};

const noImageItem: Item = {
  url: 'https://example.com/movie/no-image',
  type: 'movie',
  title: 'A Movie Without a Poster',
  director: 'Unknown Director',
  year: 2024,
};

const meta = {
  title: '13-Item/ItemCard',
  component: ItemCard,
  tags: ['autodocs'],
  render: args => ({
    components: { ItemCard },
    setup() {
      return { args };
    },
    template: '<div style="max-width: 320px"><ItemCard v-bind="args" /></div>',
  }),
} satisfies Meta<typeof ItemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Movie: Story = {
  args: { item: movieItem },
};

export const Album: Story = {
  args: { item: songItem },
};

export const Book: Story = {
  args: { item: bookItem },
};

export const Link: Story = {
  args: { item: linkItem },
};

export const LinkMinimal: Story = {
  args: {
    item: {
      url: 'https://example.com/post',
      type: 'link',
      title: 'A Simple Link Without Much Info',
      provider: 'example.com',
    } satisfies Item,
  },
};

export const NoImage: Story = {
  args: { item: noImageItem },
};

export const AllTypes: Story = {
  render: () => ({
    components: { ItemCard },
    setup() {
      return { items: [movieItem, songItem, bookItem, linkItem, noImageItem] };
    },
    template: `
      <div class="flex flex-col gap-4" style="max-width: 320px">
        <ItemCard v-for="item in items" :key="item.url" :item="item" />
      </div>
    `,
  }),
};
