import type { Meta, StoryObj } from '@storybook/vue3';
import { StatusQuote } from '@/components/status';
import { createMockAccount, createMockStatus } from '../../mocks';
import { wideDecorator } from '../decorators';

const meta = {
  title: '07-Status/StatusQuote',
  component: StatusQuote,
  tags: ['autodocs'],
  decorators: [wideDecorator],
} satisfies Meta<typeof StatusQuote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: createMockStatus({
      account: createMockAccount({ displayName: 'Quoted Author', username: 'quoted' }),
      content: '<p>This is the original post that was quoted.</p>',
    }),
  },
};

export const LongContent: Story = {
  args: {
    status: createMockStatus({
      content: `<p>${'A long quoted post that should be truncated after a few lines. '.repeat(5)}</p>`,
    }),
  },
};
