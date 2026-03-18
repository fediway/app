import type { Meta, StoryObj } from '@storybook/vue3';
import { StatusCard } from '@/components/status';
import { createMockPreviewCard } from '../../mocks';

const meta = {
  title: '7-Status/StatusCard',
  component: StatusCard,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof StatusCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { card: createMockPreviewCard() },
};

export const NoImage: Story = {
  args: { card: createMockPreviewCard({ image: null }) },
};

export const LongTitle: Story = {
  args: {
    card: createMockPreviewCard({
      title: 'This is a very long article title that should demonstrate how the card handles text overflow and truncation in the preview',
    }),
  },
};
