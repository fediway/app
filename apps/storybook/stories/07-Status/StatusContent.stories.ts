import type { Meta, StoryObj } from '@storybook/vue3';
import { StatusContent } from '@/components/status';
import { wideDecorator } from '../decorators';

const meta = {
  title: '07-Status/StatusContent',
  component: StatusContent,
  tags: ['autodocs'],
  decorators: [wideDecorator],
} satisfies Meta<typeof StatusContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { content: '<p>Just shipped a new feature for the fediverse app!</p>' },
};

export const WithSpoiler: Story = {
  args: {
    content: '<p>The ending was incredible, I did not see that twist coming.</p>',
    spoilerText: 'Movie spoilers',
    collapsed: true,
  },
};

export const LongContent: Story = {
  args: {
    content: `<p>${'A detailed post about software development. '.repeat(20)}</p>`,
  },
};

export const Empty: Story = {
  args: { content: '' },
};
