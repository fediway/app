import type { Meta, StoryObj } from '@storybook/vue3';
import ComposeToolbar from '@/components/compose/ComposeToolbar.vue';

const meta = {
  title: '8-Compose/ComposeToolbar',
  component: ComposeToolbar,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof ComposeToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { showContentWarning: false, showPoll: false },
};

export const CWActive: Story = {
  args: { showContentWarning: true, showPoll: false },
};

export const PollActive: Story = {
  args: { showContentWarning: false, showPoll: true },
};
