import type { Meta, StoryObj } from '@storybook/vue3';
import { PollDisplay } from '@/components/status';
import { wideDecorator } from '../decorators';

const meta = {
  title: '07-Status/PollDisplay',
  component: PollDisplay,
  tags: ['autodocs'],
  decorators: [wideDecorator],
} satisfies Meta<typeof PollDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    poll: {
      id: '1',
      expired: false,
      multiple: false,
      votesCount: 234,
      votersCount: 210,
      voted: true,
      ownVotes: [0],
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      options: [
        { title: 'Vue.js', votesCount: 120, emojis: [] },
        { title: 'React', votesCount: 85, emojis: [] },
        { title: 'Svelte', votesCount: 29, emojis: [] },
      ],
    },
  },
};

export const Ended: Story = {
  args: {
    poll: {
      id: '2',
      expired: true,
      multiple: false,
      votesCount: 1580,
      votersCount: 1420,
      voted: true,
      ownVotes: [1],
      expiresAt: new Date(Date.now() - 86400000).toISOString(),
      options: [
        { title: 'Tabs', votesCount: 890, emojis: [] },
        { title: 'Spaces', votesCount: 690, emojis: [] },
      ],
    },
  },
};

export const MultipleChoice: Story = {
  args: {
    poll: {
      id: '3',
      expired: false,
      multiple: true,
      votesCount: 456,
      votersCount: 180,
      voted: true,
      ownVotes: [0, 2],
      expiresAt: new Date(Date.now() + 172800000).toISOString(),
      options: [
        { title: 'TypeScript', votesCount: 180, emojis: [] },
        { title: 'JavaScript', votesCount: 120, emojis: [] },
        { title: 'Rust', votesCount: 96, emojis: [] },
        { title: 'Go', votesCount: 60, emojis: [] },
      ],
    },
  },
};

export const NotVoted: Story = {
  args: {
    poll: {
      id: '4',
      expired: false,
      multiple: false,
      votesCount: 42,
      votersCount: 42,
      voted: false,
      ownVotes: null,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      options: [
        { title: 'Yes', votesCount: 28, emojis: [] },
        { title: 'No', votesCount: 14, emojis: [] },
      ],
    },
  },
};
