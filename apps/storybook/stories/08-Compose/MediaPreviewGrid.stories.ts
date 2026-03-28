import type { Meta, StoryObj } from '@storybook/vue3';
import type { MediaItem } from '@/components/compose/MediaPreviewGrid.vue';
import MediaPreviewGrid from '@/components/compose/MediaPreviewGrid.vue';
import { wideDecorator } from '../decorators';

function makeMedia(overrides: Partial<MediaItem> & { seed: string }): MediaItem {
  return {
    previewUrl: `https://picsum.photos/seed/${overrides.seed}/400/400`,
    altText: '',
    progress: 100,
    status: 'complete',
    type: 'image',
    ...overrides,
  };
}

const meta = {
  title: '08-Compose/MediaPreviewGrid',
  component: MediaPreviewGrid,
  tags: ['autodocs'],
  decorators: [wideDecorator],
} satisfies Meta<typeof MediaPreviewGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleImage: Story = {
  args: {
    media: [makeMedia({ seed: 'a' })],
  },
};

export const TwoImages: Story = {
  args: {
    media: [
      makeMedia({ seed: 'a' }),
      makeMedia({ seed: 'b' }),
    ],
  },
};

export const FourImages: Story = {
  args: {
    media: [
      makeMedia({ seed: 'a' }),
      makeMedia({ seed: 'b' }),
      makeMedia({ seed: 'c' }),
      makeMedia({ seed: 'd' }),
    ],
  },
};

export const WithAltText: Story = {
  args: {
    media: [
      makeMedia({ seed: 'a', altText: 'Mountain landscape at sunset' }),
      makeMedia({ seed: 'b', altText: '' }),
      makeMedia({ seed: 'c', altText: 'A cat sitting on a windowsill' }),
    ],
  },
};

export const Uploading: Story = {
  args: {
    media: [
      makeMedia({ seed: 'a' }),
      makeMedia({ seed: 'b', progress: 45, status: 'uploading' }),
      makeMedia({ seed: 'c', progress: 80, status: 'uploading' }),
    ],
  },
};

export const WithError: Story = {
  args: {
    media: [
      makeMedia({ seed: 'a' }),
      makeMedia({ seed: 'b', progress: 0, status: 'error' }),
    ],
  },
};

export const MixedStates: Story = {
  args: {
    media: [
      makeMedia({ seed: 'a', altText: 'Complete with alt' }),
      makeMedia({ seed: 'b', progress: 60, status: 'uploading' }),
      makeMedia({ seed: 'c', progress: 0, status: 'error' }),
      makeMedia({ seed: 'd' }),
    ],
  },
};
