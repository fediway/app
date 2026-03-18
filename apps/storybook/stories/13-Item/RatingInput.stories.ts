import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { RatingInput } from '@/components/ui/rating';

const meta = {
  title: '13-Item/RatingInput',
  component: RatingInput,
  tags: ['autodocs'],
} satisfies Meta<typeof RatingInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { RatingInput },
    setup() {
      return { value: ref(0) };
    },
    template: '<RatingInput v-model="value" />',
  }),
};

export const PreSelected: Story = {
  render: () => ({
    components: { RatingInput },
    setup() {
      return { value: ref(4) };
    },
    template: '<RatingInput v-model="value" />',
  }),
};

export const Disabled: Story = {
  args: { modelValue: 3, disabled: true },
};
