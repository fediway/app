import type { Meta, StoryObj } from '@storybook/vue3';
import { Badge } from '@/components/ui/badge';

const meta = {
  title: '02-Primitives/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'muted'],
    },
  },
  args: {
    variant: 'default',
  },
  render: args => ({
    components: { Badge },
    setup() {
      return { args };
    },
    template: '<Badge v-bind="args">Follows you</Badge>',
  }),
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = {
  args: { variant: 'primary' },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Muted: Story = {
  args: { variant: 'muted' },
};

export const AllVariants: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <Badge variant="default">Follows you</Badge>
        <Badge variant="primary">Primary</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="muted">Muted</Badge>
      </div>
    `,
  }),
};
