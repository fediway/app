import type { Meta, StoryObj } from '@storybook/vue3';
import { StatusMedia } from '@/components/status';
import { createMockAttachment } from '../../mocks';

const meta = {
  title: '7-Status/StatusMedia',
  component: StatusMedia,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof StatusMedia>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleImage: Story = {
  args: { attachments: [createMockAttachment('image')] },
};

export const TwoImages: Story = {
  args: {
    attachments: [
      createMockAttachment('image', { id: 'a' }),
      createMockAttachment('image', { id: 'b' }),
    ],
  },
};

export const FourImages: Story = {
  args: {
    attachments: [
      createMockAttachment('image', { id: 'a' }),
      createMockAttachment('image', { id: 'b' }),
      createMockAttachment('image', { id: 'c' }),
      createMockAttachment('image', { id: 'd' }),
    ],
  },
};

export const Sensitive: Story = {
  args: {
    attachments: [createMockAttachment('image')],
    sensitive: true,
  },
};
