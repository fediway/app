import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import VisibilitySelector from '@/components/compose/VisibilitySelector.vue';

const meta = {
  title: '8-Compose/VisibilitySelector',
  component: VisibilitySelector,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
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
