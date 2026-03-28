import type { Meta, StoryObj } from '@storybook/vue3';
import ComposeToolbar from '@/components/compose/ComposeToolbar.vue';
import { wideDecorator } from '../decorators';

const meta = {
  title: '08-Compose/ComposeToolbar',
  component: ComposeToolbar,
  tags: ['autodocs'],
  decorators: [wideDecorator],
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

export const MediaDisabled: Story = {
  args: { showContentWarning: false, showPoll: false, disableMedia: true },
};

export const PollDisabled: Story = {
  args: { showContentWarning: false, showPoll: false, disablePoll: true },
};
