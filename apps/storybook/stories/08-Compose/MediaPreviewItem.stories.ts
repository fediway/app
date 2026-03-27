import type { Meta, StoryObj } from '@storybook/vue3';
import MediaPreviewItem from '@/components/compose/MediaPreviewItem.vue';

const SAMPLE_IMAGE = 'https://picsum.photos/seed/fediway1/400/400';

const meta = {
  title: '08-Compose/MediaPreviewItem',
  component: MediaPreviewItem,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="padding: 24px"><story /></div>' })],
} satisfies Meta<typeof MediaPreviewItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Complete: Story = {
  args: {
    previewUrl: SAMPLE_IMAGE,
    altText: '',
    progress: 100,
    status: 'complete',
    type: 'image',
  },
};

export const Uploading25: Story = {
  args: {
    previewUrl: SAMPLE_IMAGE,
    altText: '',
    progress: 25,
    status: 'uploading',
    type: 'image',
  },
};

export const Uploading75: Story = {
  args: {
    previewUrl: SAMPLE_IMAGE,
    altText: '',
    progress: 75,
    status: 'uploading',
    type: 'image',
  },
};

export const Error: Story = {
  args: {
    previewUrl: SAMPLE_IMAGE,
    altText: '',
    progress: 0,
    status: 'error',
    type: 'image',
  },
};

export const WithAltText: Story = {
  args: {
    previewUrl: SAMPLE_IMAGE,
    altText: 'A beautiful landscape with mountains',
    progress: 100,
    status: 'complete',
    type: 'image',
  },
};

export const WithoutAltText: Story = {
  args: {
    previewUrl: SAMPLE_IMAGE,
    altText: '',
    progress: 100,
    status: 'complete',
    type: 'image',
  },
};

export const Video: Story = {
  args: {
    previewUrl: SAMPLE_IMAGE,
    altText: '',
    progress: 100,
    status: 'complete',
    type: 'video',
  },
};
