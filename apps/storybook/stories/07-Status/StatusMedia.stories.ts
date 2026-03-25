import type { Meta, StoryObj } from '@storybook/vue3';
import { StatusMedia } from '@/components/status';
import {
  createAudioAttachment,
  createGifvAttachment,
  createMockAttachment,
  createVideoAttachment,
} from '../../mocks';

const meta = {
  title: '07-Status/StatusMedia',
  component: StatusMedia,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof StatusMedia>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleImage: Story = {
  args: { attachments: [createMockAttachment('image', { id: 'sm-1' })] },
};

export const TwoImages: Story = {
  args: {
    attachments: [
      createMockAttachment('image', { id: 'sm-2a' }),
      createMockAttachment('image', { id: 'sm-2b' }),
    ],
  },
};

export const ThreeImages: Story = {
  args: {
    attachments: [
      createMockAttachment('image', { id: 'sm-3a' }),
      createMockAttachment('image', { id: 'sm-3b' }),
      createMockAttachment('image', { id: 'sm-3c' }),
    ],
  },
};

export const FourImages: Story = {
  args: {
    attachments: [
      createMockAttachment('image', { id: 'sm-4a' }),
      createMockAttachment('image', { id: 'sm-4b' }),
      createMockAttachment('image', { id: 'sm-4c' }),
      createMockAttachment('image', { id: 'sm-4d' }),
    ],
  },
};

export const VideoWithImages: Story = {
  name: 'Video + Images',
  args: {
    attachments: [
      createVideoAttachment('sm-vid'),
      createMockAttachment('image', { id: 'sm-vi1' }),
      createMockAttachment('image', { id: 'sm-vi2' }),
    ],
  },
};

export const WithAudio: Story = {
  name: 'Images + Audio',
  args: {
    attachments: [
      createMockAttachment('image', { id: 'sm-aud1' }),
      createAudioAttachment('sm-aud'),
    ],
  },
};

export const FiveImageCarousel: Story = {
  name: 'Five Images (carousel)',
  args: {
    attachments: [
      createMockAttachment('image', { id: 'sm-c1' }),
      createMockAttachment('image', { id: 'sm-c2' }),
      createMockAttachment('image', { id: 'sm-c3' }),
      createMockAttachment('image', { id: 'sm-c4' }),
      createMockAttachment('image', { id: 'sm-c5' }),
    ],
  },
};

export const MixedWithGifv: Story = {
  name: 'Image + GifV',
  args: {
    attachments: [
      createMockAttachment('image', { id: 'sm-mg1' }),
      createGifvAttachment('sm-mg2'),
    ],
  },
};

export const Sensitive: Story = {
  args: {
    attachments: [createMockAttachment('image', { id: 'sm-s1' })],
    sensitive: true,
  },
};
