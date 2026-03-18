import type { Meta, StoryObj } from '@storybook/vue3';
import PollEditor from '@/components/compose/PollEditor.vue';

const meta = {
  title: '8-Compose/PollEditor',
  component: PollEditor,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
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
