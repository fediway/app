import type { Meta, StoryObj } from '@storybook/vue3';
import CharacterCounter from '@/components/compose/CharacterCounter.vue';

const meta = {
  title: '08-Compose/CharacterCounter',
  component: CharacterCounter,
  tags: ['autodocs'],
} satisfies Meta<typeof CharacterCounter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { current: 42, limit: 500 },
};

export const Warning: Story = {
  args: { current: 460, limit: 500 },
};

export const OverLimit: Story = {
  args: { current: 520, limit: 500 },
};
