import type { Meta, StoryObj } from '@storybook/vue3';
import { Badge } from '@/components/ui/badge';

const starIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
const circleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/></svg>`;

const meta = {
  title: '2-Primitives/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['blue', 'green', 'red', 'yellow', 'gray'],
    },
  },
  args: {
    variant: 'blue',
  },
  render: args => ({
    components: { Badge },
    setup() {
      return { args };
    },
    template: `<Badge v-bind="args"><template #icon>${starIcon}</template>Label</Badge>`,
  }),
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Blue: Story = {
  args: { variant: 'blue' },
};

export const Green: Story = {
  args: { variant: 'green' },
};

export const Red: Story = {
  args: { variant: 'red' },
};

export const Yellow: Story = {
  args: { variant: 'yellow' },
};

export const Gray: Story = {
  args: { variant: 'gray' },
};

export const WithoutIcon: Story = {
  render: () => ({
    components: { Badge },
    template: `<Badge variant="blue">No icon</Badge>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <Badge variant="blue"><template #icon>${starIcon}</template>Blue</Badge>
        <Badge variant="green"><template #icon>${checkIcon}</template>Green</Badge>
        <Badge variant="red"><template #icon>${circleIcon}</template>Red</Badge>
        <Badge variant="yellow"><template #icon>${starIcon}</template>Yellow</Badge>
        <Badge variant="gray"><template #icon>${circleIcon}</template>Gray</Badge>
      </div>
    `,
  }),
};
