import type { Meta, StoryObj } from '@storybook/vue3';
import Avatar from '@/components/primitives/Avatar.vue';

const meta = {
  title: '02-Primitives/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
  args: {
    src: 'https://randomuser.me/api/portraits/women/44.jpg',
    alt: 'User avatar',
    size: 'md',
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithImage: Story = {
  args: {
    src: 'https://randomuser.me/api/portraits/men/32.jpg',
    alt: 'User with avatar',
  },
};

export const NoImage: Story = {
  args: {
    src: null,
    alt: 'User without avatar',
  },
};

export const AllSizes: Story = {
  render: () => ({
    components: { Avatar },
    template: `
      <div class="flex items-end gap-4">
        <Avatar size="xs" src="https://randomuser.me/api/portraits/women/17.jpg" alt="XS" />
        <Avatar size="sm" src="https://randomuser.me/api/portraits/men/75.jpg" alt="SM" />
        <Avatar size="md" src="https://randomuser.me/api/portraits/women/44.jpg" alt="MD" />
        <Avatar size="lg" src="https://randomuser.me/api/portraits/men/32.jpg" alt="LG" />
        <Avatar size="xl" src="https://randomuser.me/api/portraits/women/68.jpg" alt="XL" />
      </div>
    `,
  }),
};

export const AllSizesNoImage: Story = {
  render: () => ({
    components: { Avatar },
    template: `
      <div class="flex items-end gap-4">
        <Avatar size="xs" alt="XS" />
        <Avatar size="sm" alt="SM" />
        <Avatar size="md" alt="MD" />
        <Avatar size="lg" alt="LG" />
        <Avatar size="xl" alt="XL" />
      </div>
    `,
  }),
};
