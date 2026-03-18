import type { Meta, StoryObj } from '@storybook/vue3';
import { MediaGallery } from '@/components/media';
import { createMockAttachment } from '../../mocks';

const meta = {
  title: '12-Media/MediaGallery',
  component: MediaGallery,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof MediaGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleImage: Story = {
  args: { attachments: [createMockAttachment('image')] },
};

export const TwoImages: Story = {
  args: {
    attachments: [
      createMockAttachment('image', { id: '1' }),
      createMockAttachment('image', { id: '2' }),
    ],
  },
};

export const FourImages: Story = {
  args: {
    attachments: [
      createMockAttachment('image', { id: '1' }),
      createMockAttachment('image', { id: '2' }),
      createMockAttachment('image', { id: '3' }),
      createMockAttachment('image', { id: '4' }),
    ],
  },
};

export const Sensitive: Story = {
  args: {
    attachments: [createMockAttachment('image')],
    sensitive: true,
  },
};

export const Empty: Story = {
  args: { attachments: [] },
};
