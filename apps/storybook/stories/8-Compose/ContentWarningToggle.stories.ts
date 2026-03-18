import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import ContentWarningToggle from '@/components/compose/ContentWarningToggle.vue';

const meta = {
  title: '8-Compose/ContentWarningToggle',
  component: ContentWarningToggle,
  tags: ['autodocs'],
} satisfies Meta<typeof ContentWarningToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {
  render: () => ({
    components: { ContentWarningToggle },
    setup() { return { value: ref(false) }; },
    template: '<ContentWarningToggle v-model="value" />',
  }),
};

export const On: Story = {
  render: () => ({
    components: { ContentWarningToggle },
    setup() { return { value: ref(true) }; },
    template: '<ContentWarningToggle v-model="value" />',
  }),
};
