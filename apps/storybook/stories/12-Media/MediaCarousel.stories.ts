import type { Meta, StoryObj } from '@storybook/vue3';
import { MediaCarousel } from '@/components/media';
import { createMockAttachment } from '../../mocks';

const meta = {
  title: '12-Media/MediaCarousel',
  component: MediaCarousel,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof MediaCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    attachments: [
      createMockAttachment('image', { id: '1' }),
      createMockAttachment('image', { id: '2' }),
      createMockAttachment('image', { id: '3' }),
    ],
  },
};

export const SingleImage: Story = {
  args: { attachments: [createMockAttachment('image')] },
};

export const Sensitive: Story = {
  args: {
    attachments: [
      createMockAttachment('image', { id: '1' }),
      createMockAttachment('image', { id: '2' }),
    ],
    sensitive: true,
  },
};
