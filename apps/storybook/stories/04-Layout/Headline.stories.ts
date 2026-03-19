import type { Meta, StoryObj } from '@storybook/vue3';
import Headline from '@/components/ui/headline/Headline.vue';

const meta = {
  title: '04-Layout/Headline',
  component: Headline,
  tags: ['autodocs'],
  argTypes: {
    level: { control: 'select', options: ['h1', 'h2', 'h3'] },
  },
  args: {
    level: 'h2',
  },
} satisfies Meta<typeof Headline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1: Story = {
  args: { level: 'h1' },
  render: args => ({
    components: { Headline },
    setup() { return { args }; },
    template: '<Headline v-bind="args">Page Title (H1 · 22px)</Headline>',
  }),
};

export const H2: Story = {
  args: { level: 'h2' },
  render: args => ({
    components: { Headline },
    setup() { return { args }; },
    template: '<Headline v-bind="args">Section Title (H2 · 18px)</Headline>',
  }),
};

export const H3: Story = {
  args: { level: 'h3' },
  render: args => ({
    components: { Headline },
    setup() { return { args }; },
    template: '<Headline v-bind="args">Subsection Title (H3 · 16px)</Headline>',
  }),
};

export const AllLevels: Story = {
  render: () => ({
    components: { Headline },
    template: `
      <div class="flex flex-col gap-4">
        <Headline level="h1">H1 · Page Title · 22px Bold</Headline>
        <Headline level="h2">H2 · Section Title · 18px Bold</Headline>
        <Headline level="h3">H3 · Subsection Title · 16px Bold</Headline>
      </div>
    `,
  }),
};
