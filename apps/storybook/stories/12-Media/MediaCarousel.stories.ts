import type { Meta, StoryObj } from '@storybook/vue3';
import { MediaCarousel } from '@/components/media';
import {
  createFocalPointAttachment,
  createGifvAttachment,
  createMockAttachment,
  createVideoAttachment,
} from '../../mocks';

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
      createMockAttachment('image', { id: 'c-1' }),
      createMockAttachment('image', { id: 'c-2' }),
      createMockAttachment('image', { id: 'c-3' }),
    ],
  },
};

export const FiveImages: Story = {
  args: {
    attachments: [
      createMockAttachment('image', { id: 'c5-1' }),
      createMockAttachment('image', { id: 'c5-2' }),
      createMockAttachment('image', { id: 'c5-3' }),
      createMockAttachment('image', { id: 'c5-4' }),
      createMockAttachment('image', { id: 'c5-5' }),
    ],
  },
};

export const MixedMedia: Story = {
  name: 'Mixed (images + video + gifv)',
  args: {
    attachments: [
      createMockAttachment('image', { id: 'cm-1' }),
      createVideoAttachment('cm-vid'),
      createMockAttachment('image', { id: 'cm-2' }),
      createGifvAttachment('cm-gif'),
    ],
  },
};

export const WithFocalPoints: Story = {
  args: {
    attachments: [
      createFocalPointAttachment('cfp-1', -0.8, 0.6),
      createFocalPointAttachment('cfp-2', 0.8, -0.6),
      createFocalPointAttachment('cfp-3', 0, 0),
    ],
  },
};

export const Sensitive: Story = {
  args: {
    attachments: [
      createMockAttachment('image', { id: 'cs-1' }),
      createMockAttachment('image', { id: 'cs-2' }),
    ],
    sensitive: true,
  },
};
