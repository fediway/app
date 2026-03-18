import type { Meta, StoryObj } from '@storybook/vue3';
import ChatList from '@/components/chat/ChatList.vue';

const meta = {
  title: '11-Chat/ChatList',
  component: ChatList,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof ChatList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    conversations: [],
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    conversations: [],
    loading: true,
  },
};
