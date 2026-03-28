import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, within } from '@storybook/test';
import PollEditor from '@/components/compose/PollEditor.vue';
import { wideDecorator } from '../decorators';

const meta = {
  title: '08-Compose/PollEditor',
  component: PollEditor,
  tags: ['autodocs'],
  decorators: [wideDecorator],
} satisfies Meta<typeof PollEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { options: ['', ''], duration: 86400, multiple: false },
};

export const FourOptions: Story = {
  args: {
    options: ['Vue.js', 'React', 'Svelte', 'Angular'],
    duration: 86400,
    multiple: false,
  },
};

export const WithLongDuration: Story = {
  args: {
    options: ['Yes', 'No'],
    duration: 604800,
    multiple: true,
  },
};

export const AddAndRemoveOption: Story = {
  parameters: {
    docs: { description: { story: 'Tests adding a poll option and verifying it appears.' } },
  },
  args: { options: ['Option A', 'Option B'], duration: 86400, multiple: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should start with 2 input fields
    const inputs = canvas.getAllByRole('textbox');
    expect(inputs).toHaveLength(2);

    // Click "Add option"
    const addButton = canvas.getByText('Add option');
    await userEvent.click(addButton);

    // Should now have 3 inputs
    const updatedInputs = canvas.getAllByRole('textbox');
    expect(updatedInputs).toHaveLength(3);
  },
};
