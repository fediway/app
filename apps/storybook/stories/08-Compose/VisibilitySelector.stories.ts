import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, within } from '@storybook/test';
import { ref } from 'vue';
import VisibilitySelector from '@/components/compose/VisibilitySelector.vue';
import { wideDecorator } from '../decorators';

const meta = {
  title: '08-Compose/VisibilitySelector',
  component: VisibilitySelector,
  tags: ['autodocs'],
  decorators: [wideDecorator],
} satisfies Meta<typeof VisibilitySelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { VisibilitySelector },
    setup() { return { value: ref('public') }; },
    template: '<VisibilitySelector v-model="value" />',
  }),
};

export const PrivateSelected: Story = {
  render: () => ({
    components: { VisibilitySelector },
    setup() { return { value: ref('private') }; },
    template: '<VisibilitySelector v-model="value" />',
  }),
};

export const DirectSelected: Story = {
  render: () => ({
    components: { VisibilitySelector },
    setup() { return { value: ref('direct') }; },
    template: '<VisibilitySelector v-model="value" />',
  }),
};

export const ClickToSelect: Story = {
  parameters: {
    docs: { description: { story: 'Tests that clicking a visibility option selects it and updates the active state.' } },
  },
  render: () => ({
    components: { VisibilitySelector },
    setup() { return { value: ref('public') }; },
    template: '<VisibilitySelector v-model="value" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole('radio');

    // Public should be selected initially
    expect(radios[0]).toHaveAttribute('data-state', 'checked');

    // Click Private (3rd option)
    await userEvent.click(radios[2]!);
    expect(radios[2]).toHaveAttribute('data-state', 'checked');
    expect(radios[0]).toHaveAttribute('data-state', 'unchecked');
  },
};
