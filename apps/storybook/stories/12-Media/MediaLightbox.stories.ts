import type { Meta, StoryObj } from '@storybook/vue3';
import { MediaLightbox } from '@/components/media';
import { createMockAttachment } from '../../mocks';

const meta = {
  title: '12-Media/MediaLightbox',
  component: MediaLightbox,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px; height: 400px;"><story /></div>' })],
} satisfies Meta<typeof MediaLightbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    attachments: [
      createMockAttachment('image', { id: '1' }),
      createMockAttachment('image', { id: '2' }),
      createMockAttachment('image', { id: '3' }),
    ],
    isOpen: true,
    initialIndex: 0,
  },
};

export const SingleImage: Story = {
  args: {
    attachments: [createMockAttachment('image')],
    isOpen: true,
    initialIndex: 0,
  },
};
