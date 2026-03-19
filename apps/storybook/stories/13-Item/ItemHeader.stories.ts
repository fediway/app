import type { Meta, StoryObj } from '@storybook/vue3';
import ItemHeader from '@/components/item/item-header/ItemHeader.vue';
import { TagItem } from '@/components/ui/tag-item';

const meta = {
  title: '13-Item/ItemHeader',
  component: ItemHeader,
  tags: ['autodocs'],
  args: {
    title: 'Dune: Part Two',
    creator: 'Denis Villeneuve',
    year: 2025,
    duration: '2h 46m',
    genres: 'Sci-Fi, Adventure',
    averageRating: 4.1,
    takesCount: 12847,
    posterSrc: 'https://picsum.photos/seed/dune2/264/390',
    posterAlt: 'Dune: Part Two poster',
    synopsis: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, Paul endeavors to prevent a terrible future only he can foresee.',
    followAvatars: [
      { initial: 'B' },
      { src: 'https://picsum.photos/seed/alice/200/200', alt: 'Alice' },
      { initial: 'T' },
    ],
    followLabel: '3 takes from people you follow',
  },
  render: args => ({
    components: { ItemHeader, TagItem },
    setup() {
      return { args };
    },
    template: `
      <div style="max-width: 390px">
        <ItemHeader v-bind="args">
          <template #tag>
            <TagItem variant="blue">Film</TagItem>
          </template>
        </ItemHeader>
      </div>
    `,
  }),
} satisfies Meta<typeof ItemHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Album: Story = {
  render: args => ({
    components: { ItemHeader, TagItem },
    setup() {
      return { args };
    },
    template: `
      <div style="max-width: 390px">
        <ItemHeader v-bind="args">
          <template #tag>
            <TagItem variant="green">Album</TagItem>
          </template>
        </ItemHeader>
      </div>
    `,
  }),
  args: {
    title: 'Harry\'s House',
    creator: 'Harry Styles',
    year: 2022,
    duration: '42 min',
    genres: 'Pop, Indie Pop',
    averageRating: 3.8,
    takesCount: 4231,
    posterSrc: 'https://picsum.photos/seed/harrys-house/264/264',
    synopsis: undefined,
    followAvatars: [
      { src: 'https://picsum.photos/seed/b1/200/200' },
    ],
    followLabel: '1 take from someone you follow',
  },
};

export const NoFollowers: Story = {
  args: {
    followAvatars: [],
    followLabel: undefined,
  },
};

export const MinimalInfo: Story = {
  render: args => ({
    components: { ItemHeader },
    setup() {
      return { args };
    },
    template: `
      <div style="max-width: 390px">
        <ItemHeader v-bind="args" />
      </div>
    `,
  }),
  args: {
    title: 'Some Article',
    creator: undefined,
    year: undefined,
    duration: undefined,
    genres: undefined,
    averageRating: undefined,
    takesCount: undefined,
    posterSrc: null,
    synopsis: undefined,
    followAvatars: [],
    followLabel: undefined,
  },
};
