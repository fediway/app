import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { Toggle } from '@/components/ui/toggle';

const meta = {
  title: '03-Form/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 400px"><story /></div>' })],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { Toggle },
    setup() {
      const value = ref(false);
      return { value };
    },
    template: '<Toggle v-model="value" label="Enable notifications" />',
  }),
};

export const On: Story = {
  render: () => ({
    components: { Toggle },
    setup() {
      const value = ref(true);
      return { value };
    },
    template: '<Toggle v-model="value" label="Enable notifications" />',
  }),
};

export const Disabled: Story = {
  args: { modelValue: false, label: 'Disabled toggle', disabled: true },
};

export const WithDescription: Story = {
  render: () => ({
    components: { Toggle },
    setup() {
      const value = ref(true);
      return { value };
    },
    template: '<Toggle v-model="value" label="Mark media as sensitive" description="Hide your media behind a warning" />',
  }),
};
