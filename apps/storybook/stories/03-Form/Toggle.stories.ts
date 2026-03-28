import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, within } from '@storybook/test';
import { ref } from 'vue';
import { Toggle } from '@/components/ui/toggle';
import { mediumDecorator } from '../decorators';

const meta = {
  title: '03-Form/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  decorators: [mediumDecorator],
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

export const ClickToToggle: Story = {
  parameters: {
    docs: { description: { story: 'Tests that clicking the toggle switches its state and updates aria-checked.' } },
  },
  render: () => ({
    components: { Toggle },
    setup() {
      const value = ref(false);
      return { value };
    },
    template: '<Toggle v-model="value" label="Click me" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');

    // Initially off
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    // Click to turn on
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    // Click again to turn off
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  },
};
