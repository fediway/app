import type { Meta, StoryObj } from '@storybook/vue3';
import AccountList from '@/components/account/AccountList.vue';
import Section from '@/components/ui/section/Section.vue';
import { mediumDecorator } from '../decorators';

const meta = {
  title: '04-Layout/Section',
  component: Section,
  tags: ['autodocs'],
  decorators: [mediumDecorator],
  args: {
    title: 'Section Title',
    showAction: false,
    actionLabel: 'View all',
  },
  render: args => ({
    components: { Section },
    setup() {
      return { args };
    },
    template: `
      <Section v-bind="args">
        <p class="px-5 text-foreground/80">Section content goes here.</p>
      </Section>
    `,
  }),
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    title: 'Popular Films',
    showAction: true,
    actionLabel: 'View all',
  },
};

export const PopularFilms: Story = {
  render: args => ({
    components: { Section },
    setup() {
      const films = [
        { title: 'Dune: Part Two', meta: 'Denis Villeneuve, 2025 – 4.6 Stars', image: 'https://picsum.photos/seed/dune2/96/142' },
        { title: 'Pirates of the Caribbean: The Curse of the Black Pearl', meta: 'Gore Verbinski, 2003', image: 'https://picsum.photos/seed/potc/96/142' },
        { title: 'F1', meta: 'Joseph Kosinski, 2025 – 3.9 Stars', image: 'https://picsum.photos/seed/f1movie/96/142' },
      ];
      return { args, films };
    },
    template: `
      <Section v-bind="args">
        <ul class="flex flex-col">
          <li v-for="film in films" :key="film.title" class="flex items-center gap-3 px-5 py-2">
            <div class="shrink-0 w-12 h-[71px] rounded-sm border border-border overflow-hidden bg-muted">
              <img :src="film.image" :alt="film.title" class="w-full h-full object-cover" />
            </div>
            <div class="min-w-0 flex-1 flex flex-col gap-1.5">
              <p class="font-bold text-base text-foreground truncate">{{ film.title }}</p>
              <div class="flex items-center gap-1.5">
                <span class="inline-flex items-center gap-0.5 rounded px-1 text-xs font-medium bg-blue-100 text-foreground h-5">Film</span>
                <span class="text-sm text-foreground/80">{{ film.meta }}</span>
              </div>
            </div>
          </li>
        </ul>
      </Section>
    `,
  }),
  args: {
    title: 'Popular Films',
    showAction: true,
    actionLabel: 'View all',
  },
};

export const RecentFavorites: Story = {
  render: args => ({
    components: { Section },
    setup() {
      const items = [
        { title: 'Breaking Bad', meta: 'Vince Gilligan, 2008–2013', tag: 'TV Show', tagClass: 'bg-orange-100', image: 'https://picsum.photos/seed/bb/96/142' },
        { title: 'Pirates of the Caribbean: The Curse of the Black Pearl', meta: 'Gore Verbinski, 2003', tag: 'Film', tagClass: 'bg-blue-100', image: 'https://picsum.photos/seed/potc/96/142' },
        { title: 'Harry\'s House', meta: 'Harry Styles, 2023', tag: 'Album', tagClass: 'bg-green-100', image: 'https://picsum.photos/seed/harrys-house/96/96', square: true },
      ];
      return { args, items };
    },
    template: `
      <Section v-bind="args">
        <ul class="flex flex-col">
          <li v-for="item in items" :key="item.title" class="flex items-center gap-3 px-5 py-2">
            <div class="shrink-0 rounded-sm border border-border overflow-hidden bg-muted" :class="item.square ? 'w-12 h-12' : 'w-12 h-[71px]'">
              <img :src="item.image" :alt="item.title" class="w-full h-full object-cover" />
            </div>
            <div class="min-w-0 flex-1 flex flex-col gap-1.5">
              <p class="font-bold text-base text-foreground truncate">{{ item.title }}</p>
              <div class="flex items-center gap-1.5">
                <span class="inline-flex items-center gap-0.5 rounded px-1 text-xs font-medium text-foreground h-5" :class="item.tagClass">{{ item.tag }}</span>
                <span class="text-sm text-foreground/80">{{ item.meta }}</span>
              </div>
            </div>
          </li>
        </ul>
      </Section>
    `,
  }),
  args: {
    title: 'Recent Favorites',
    showAction: false,
  },
};

const mockUsers = [
  { displayName: 'Alice Chen', handle: '@alice.chen@mastodon.social', avatarSrc: 'https://picsum.photos/seed/alice/200/200' },
  { displayName: 'Alice Chen', handle: '@alice.chen@mastodon.social', avatarSrc: 'https://picsum.photos/seed/alice2/200/200' },
  { displayName: 'Alice Chen', handle: '@alice.chen@mastodon.social', avatarSrc: 'https://picsum.photos/seed/alice3/200/200' },
];

export const AccountListSection: Story = {
  render: args => ({
    components: { Section, AccountList },
    setup() {
      return { args, users: mockUsers };
    },
    template: `
      <Section v-bind="args">
        <AccountList :users="users" />
      </Section>
    `,
  }),
  args: {
    title: 'User Suggestions',
    showAction: true,
    actionLabel: 'View all',
  },
};
