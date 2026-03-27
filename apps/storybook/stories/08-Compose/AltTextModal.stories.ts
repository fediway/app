import type { Meta, StoryObj } from '@storybook/vue3';
import AltTextModal from '@/components/compose/AltTextModal.vue';

const SAMPLE_IMAGE = 'https://picsum.photos/seed/alttext/800/600';

const meta = {
  title: '08-Compose/AltTextModal',
  component: AltTextModal,
  tags: ['autodocs'],
} satisfies Meta<typeof AltTextModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    isOpen: true,
    imageUrl: SAMPLE_IMAGE,
    altText: '',
  },
};

export const WithExistingAlt: Story = {
  args: {
    isOpen: true,
    imageUrl: SAMPLE_IMAGE,
    altText: 'A serene mountain landscape with a lake reflecting the golden hues of sunset. Pine trees line the foreground.',
  },
};

export const NearLimit: Story = {
  args: {
    isOpen: true,
    imageUrl: SAMPLE_IMAGE,
    altText: 'A'.repeat(1480),
    limit: 1500,
  },
};
