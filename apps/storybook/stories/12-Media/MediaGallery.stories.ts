import type { Meta, StoryObj } from '@storybook/vue3';
import { MediaGallery } from '@/components/media';
import {
  createAttachmentWithoutPreview,
  createAudioAttachment,
  createFocalPointAttachment,
  createGifvAttachment,
  createMockAttachment,
  createPanoramaAttachment,
  createPortraitAttachment,
  createVideoAttachment,
} from '../../mocks';

const meta = {
  title: '12-Media/MediaGallery',
  component: MediaGallery,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof MediaGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Layout Stories ──────────────────────────────────────

export const SingleImage: Story = {
  args: { attachments: [createMockAttachment('image', { id: 'single' })] },
};

export const SinglePortrait: Story = {
  name: 'Single Portrait (4:5 cap)',
  args: { attachments: [createPortraitAttachment('portrait')] },
};

export const SinglePanorama: Story = {
  name: 'Single Panorama (16:9 cap)',
  args: { attachments: [createPanoramaAttachment('pano')] },
};

export const TwoImages: Story = {
  args: {
    attachments: [
      createMockAttachment('image', { id: 'two-1' }),
      createMockAttachment('image', { id: 'two-2' }),
    ],
  },
};

export const ThreeImages: Story = {
  args: {
    attachments: [
      createMockAttachment('image', { id: 'three-1' }),
      createMockAttachment('image', { id: 'three-2' }),
      createMockAttachment('image', { id: 'three-3' }),
    ],
  },
};

export const FourImages: Story = {
  args: {
    attachments: [
      createMockAttachment('image', { id: 'four-1' }),
      createMockAttachment('image', { id: 'four-2' }),
      createMockAttachment('image', { id: 'four-3' }),
      createMockAttachment('image', { id: 'four-4' }),
    ],
  },
};

export const FiveImages: Story = {
  name: 'Five Images (carousel)',
  args: {
    attachments: [
      createMockAttachment('image', { id: 'five-1' }),
      createMockAttachment('image', { id: 'five-2' }),
      createMockAttachment('image', { id: 'five-3' }),
      createMockAttachment('image', { id: 'five-4' }),
      createMockAttachment('image', { id: 'five-5' }),
    ],
  },
};

// ── Media Type Stories ──────────────────────────────────

export const SingleVideo: Story = {
  args: { attachments: [createVideoAttachment('vid')] },
};

export const SingleGifv: Story = {
  args: { attachments: [createGifvAttachment('gif')] },
};

export const MixedMedia: Story = {
  name: 'Mixed (image + video + gifv)',
  args: {
    attachments: [
      createMockAttachment('image', { id: 'mix-img' }),
      createVideoAttachment('mix-vid'),
      createGifvAttachment('mix-gif'),
    ],
  },
};

export const AudioOnly: Story = {
  args: { attachments: [createAudioAttachment('aud')] },
};

export const ImagesWithAudio: Story = {
  name: 'Images + Audio',
  args: {
    attachments: [
      createMockAttachment('image', { id: 'ia-1' }),
      createMockAttachment('image', { id: 'ia-2' }),
      createAudioAttachment('ia-aud'),
    ],
  },
};

// ── Edge Case Stories ───────────────────────────────────

export const Sensitive: Story = {
  args: {
    attachments: [
      createMockAttachment('image', { id: 'sens-1' }),
      createMockAttachment('image', { id: 'sens-2' }),
    ],
    sensitive: true,
  },
};

export const WithAltText: Story = {
  args: {
    attachments: [
      createMockAttachment('image', { id: 'alt-1', description: 'A beautiful sunset over the ocean with warm orange and pink hues' }),
      createMockAttachment('image', { id: 'alt-2', description: 'Close-up of a flower' }),
      createMockAttachment('image', { id: 'alt-3', description: null }),
    ],
  },
};

export const WithFocalPoint: Story = {
  name: 'Focal Point (cropped to subject)',
  args: {
    attachments: [
      createFocalPointAttachment('fp-1', -0.8, 0.6),
      createFocalPointAttachment('fp-2', 0.8, -0.6),
    ],
  },
};

export const MissingPreview: Story = {
  name: 'Missing Preview (blurhash fallback)',
  args: {
    attachments: [createAttachmentWithoutPreview('no-prev')],
  },
};

export const FourOfSixImages: Story = {
  name: '6 images, max 4 shown (+2 overlay)',
  args: {
    attachments: [
      createMockAttachment('image', { id: 'six-1' }),
      createMockAttachment('image', { id: 'six-2' }),
      createMockAttachment('image', { id: 'six-3' }),
      createMockAttachment('image', { id: 'six-4' }),
      createMockAttachment('image', { id: 'six-5' }),
      createMockAttachment('image', { id: 'six-6' }),
    ],
    maxGridItems: 4,
  },
};

export const Empty: Story = {
  args: { attachments: [] },
};
