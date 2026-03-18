import type { Meta, StoryObj } from '@storybook/vue3';
import { Input } from '@/components/ui/input';

const meta = {
  title: '3-Form/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    placeholder: 'Enter text...',
  },
  render: args => ({
    components: { Input },
    setup() {
      return { args };
    },
    template: '<Input v-bind="args" />',
  }),
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Placeholder: Story = {
  args: {
    placeholder: 'you@example.com',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const WithValue: Story = {
  args: {
    modelValue: 'Hello, world!',
  },
};
