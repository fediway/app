import type { Meta, StoryObj } from '@storybook/vue3';
import ButtonText from '@/components/ui/button-text/ButtonText.vue';

const meta = {
  title: '04-Layout/ButtonText',
  component: ButtonText,
  tags: ['autodocs'],
  render: args => ({
    components: { ButtonText },
    setup() { return { args }; },
    template: '<ButtonText v-bind="args">{{ args.default }}</ButtonText>',
  }),
} satisfies Meta<typeof ButtonText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { default: 'View all' },
};

export const AsLink: Story = {
  args: { as: 'a', href: '#', default: 'View all' },
};

export const CustomLabel: Story = {
  render: () => ({
    components: { ButtonText },
    template: `
      <div class="flex flex-col gap-4">
        <ButtonText>View all</ButtonText>
        <ButtonText>Show more</ButtonText>
        <ButtonText>See suggestions</ButtonText>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  args: { disabled: true, default: 'View all' },
};
