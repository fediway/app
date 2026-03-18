import type { Meta, StoryObj } from '@storybook/vue3';
import ButtonText from '@/components/ui/button-text/ButtonText.vue';

const meta = {
  title: '04-Layout/ButtonText',
  component: ButtonText,
  tags: ['autodocs'],
} satisfies Meta<typeof ButtonText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { ButtonText },
    template: '<ButtonText>View all</ButtonText>',
  }),
};

export const AsLink: Story = {
  render: () => ({
    components: { ButtonText },
    template: '<ButtonText as="a" href="#">View all</ButtonText>',
  }),
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
  render: () => ({
    components: { ButtonText },
    template: '<ButtonText disabled>View all</ButtonText>',
  }),
};
