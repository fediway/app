import type { Meta, StoryObj } from '@storybook/vue3';
import { NavIcon } from '@/components/navigation';

const meta = {
  title: '05-Navigation/NavIcon',
  component: NavIcon,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: ['home', 'search', 'explore', 'new-post', 'notifications', 'profile', 'chat', 'messages', 'favourites', 'saved', 'bookmarks', 'settings', 'menu', 'close', 'back', 'more', 'compose', 'share', 'filter'],
    },
  },
} satisfies Meta<typeof NavIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { name: 'home', size: 24 },
};

const allIcons = ['home', 'search', 'explore', 'new-post', 'notifications', 'profile', 'chat', 'messages', 'favourites', 'saved', 'bookmarks', 'settings', 'menu', 'close', 'back', 'more', 'compose', 'share', 'filter'];

export const AllIcons: Story = {
  render: () => ({
    components: { NavIcon },
    setup() {
      return { allIcons };
    },
    template: `
      <div class="grid grid-cols-4 gap-6">
        <div v-for="name in allIcons" :key="name" class="flex flex-col items-center gap-2">
          <NavIcon :name="name" :size="24" />
          <span class="text-xs text-gray-500">{{ name }}</span>
        </div>
      </div>
    `,
  }),
};
