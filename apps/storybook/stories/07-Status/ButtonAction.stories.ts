import type { Meta, StoryObj } from '@storybook/vue3';
import { PhBookmarkSimple, PhChatCircle, PhHeart, PhRepeat } from '@phosphor-icons/vue';
import ButtonAction from '@/components/ui/button-action/ButtonAction.vue';

const meta = {
  title: '07-Status/ButtonAction',
  component: ButtonAction,
  tags: ['autodocs'],
  args: {
    count: null,
  },
} satisfies Meta<typeof ButtonAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => ({
    components: { ButtonAction, PhHeart },
    setup() { return { args }; },
    template: '<ButtonAction v-bind="args"><PhHeart :size="20" /></ButtonAction>',
  }),
};

export const WithCount: Story = {
  args: { count: 42 },
  render: args => ({
    components: { ButtonAction, PhHeart },
    setup() { return { args }; },
    template: '<ButtonAction v-bind="args"><PhHeart :size="20" /></ButtonAction>',
  }),
};

export const LargeCount: Story = {
  args: { count: 12400 },
  render: args => ({
    components: { ButtonAction, PhHeart },
    setup() { return { args }; },
    template: '<ButtonAction v-bind="args"><PhHeart :size="20" /></ButtonAction>',
  }),
};

export const ActiveFavourite: Story = {
  args: { count: 1 },
  render: args => ({
    components: { ButtonAction, PhHeart },
    setup() { return { args }; },
    template: '<ButtonAction v-bind="args" class="text-rose-500 hover:text-rose-500"><PhHeart :size="20" weight="fill" /></ButtonAction>',
  }),
};

export const AllTypes: Story = {
  render: () => ({
    components: { ButtonAction, PhHeart, PhChatCircle, PhRepeat, PhBookmarkSimple },
    template: `
      <div class="flex items-center gap-4">
        <ButtonAction :count="6"><PhChatCircle :size="20" /></ButtonAction>
        <ButtonAction :count="4"><PhRepeat :size="20" /></ButtonAction>
        <ButtonAction :count="1" class="text-rose-500 hover:text-rose-500"><PhHeart :size="20" weight="fill" /></ButtonAction>
        <ButtonAction class="text-yellow hover:text-yellow"><PhBookmarkSimple :size="20" weight="fill" /></ButtonAction>
      </div>
    `,
  }),
};
