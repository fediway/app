import type { Meta, StoryObj } from '@storybook/vue3';
import { Textarea } from '@/components/ui/textarea';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: {
    placeholder: 'Type your message...',
  },
  render: args => ({
    components: { Textarea },
    setup() {
      return { args };
    },
    template: '<Textarea v-bind="args" />',
  }),
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Placeholder: Story = {
  args: {
    placeholder: 'Leave a comment...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled textarea',
  },
};

export const WithValue: Story = {
  args: {
    modelValue: 'This textarea already has some content that demonstrates how it looks with text filled in.',
  },
};
