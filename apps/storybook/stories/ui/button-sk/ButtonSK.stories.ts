import type { Meta, StoryObj } from '@storybook/vue3';
import { PhPlaceholder } from '@phosphor-icons/vue';
import ButtonSK from '@/components/ui/button-sk/ButtonSK.vue';

const meta = {
  title: 'UI/ButtonSK',
  component: ButtonSK,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['L', 'M'] },
    variant: { control: 'select', options: ['Text', 'IconOnly', 'IconLeft', 'IconRight'] },
    disabled: { control: 'boolean' },
  },
  args: {
    size: 'L',
    variant: 'Text',
    disabled: false,
  },
} satisfies Meta<typeof ButtonSK>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => ({
    components: { ButtonSK },
    setup() {
      return { args };
    },
    template: '<ButtonSK v-bind="args">Label</ButtonSK>',
  }),
};

export const SizeM: Story = {
  args: { size: 'M' },
  render: args => ({
    components: { ButtonSK },
    setup() {
      return { args };
    },
    template: '<ButtonSK v-bind="args">Label</ButtonSK>',
  }),
};

export const IconOnly: Story = {
  args: { variant: 'IconOnly' },
  render: args => ({
    components: { ButtonSK, PhPlaceholder },
    setup() {
      return { args };
    },
    template: `
      <ButtonSK v-bind="args">
        <template #icon><PhPlaceholder :size="24" /></template>
      </ButtonSK>
    `,
  }),
};

export const IconLeft: Story = {
  args: { variant: 'IconLeft' },
  render: args => ({
    components: { ButtonSK, PhPlaceholder },
    setup() {
      return { args };
    },
    template: `
      <ButtonSK v-bind="args">
        <template #icon><PhPlaceholder :size="24" /></template>
        Label
      </ButtonSK>
    `,
  }),
};

export const IconRight: Story = {
  args: { variant: 'IconRight' },
  render: args => ({
    components: { ButtonSK, PhPlaceholder },
    setup() {
      return { args };
    },
    template: `
      <ButtonSK v-bind="args">
        Label
        <template #icon><PhPlaceholder :size="24" /></template>
      </ButtonSK>
    `,
  }),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: args => ({
    components: { ButtonSK },
    setup() {
      return { args };
    },
    template: '<ButtonSK v-bind="args">Label</ButtonSK>',
  }),
};

export const AllSizes: Story = {
  render: () => ({
    components: { ButtonSK },
    template: `
      <div class="flex flex-col gap-4 items-start">
        <ButtonSK size="L">Size L</ButtonSK>
        <ButtonSK size="M">Size M</ButtonSK>
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { ButtonSK, PhPlaceholder },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <ButtonSK variant="Text">Text</ButtonSK>
        <ButtonSK variant="IconLeft">
          <template #icon><PhPlaceholder :size="24" /></template>
          Icon Left
        </ButtonSK>
        <ButtonSK variant="IconRight">
          Icon Right
          <template #icon><PhPlaceholder :size="24" /></template>
        </ButtonSK>
        <ButtonSK variant="IconOnly">
          <template #icon><PhPlaceholder :size="24" /></template>
        </ButtonSK>
      </div>
    `,
  }),
};
