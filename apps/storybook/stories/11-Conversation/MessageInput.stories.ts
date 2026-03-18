import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import MessageInput from '@/components/conversation/MessageInput.vue';

const meta = {
  title: '11-Conversation/MessageInput',
  component: MessageInput,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof MessageInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { MessageInput },
    setup() { return { value: ref('') }; },
    template: '<MessageInput v-model="value" />',
  }),
};

export const WithContent: Story = {
  render: () => ({
    components: { MessageInput },
    setup() { return { value: ref('Hello! How are you?') }; },
    template: '<MessageInput v-model="value" />',
  }),
};
