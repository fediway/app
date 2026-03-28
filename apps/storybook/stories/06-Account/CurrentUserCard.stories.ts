import type { Meta, StoryObj } from '@storybook/vue3';
import CurrentUserCard from '@/components/account/CurrentUserCard.vue';
import { narrowDecorator } from '../decorators';

const meta = {
  title: '06-Account/CurrentUserCard',
  component: CurrentUserCard,
  tags: ['autodocs'],
  decorators: [narrowDecorator],
} satisfies Meta<typeof CurrentUserCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Jane Doe',
    username: 'jane',
    avatar: 'https://picsum.photos/seed/jane/200/200',
  },
};

export const NoAvatar: Story = {
  args: { name: 'Jane Doe', username: 'jane' },
};
