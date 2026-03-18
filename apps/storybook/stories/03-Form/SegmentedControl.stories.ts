import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { SegmentedControl } from '@/components/ui/segmented-control';

const meta = {
  title: '03-Form/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 400px"><story /></div>' })],
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { SegmentedControl },
    setup() {
      return { value: ref('mock') };
    },
    template: '<SegmentedControl v-model="value" :options="[{ value: \'mock\', label: \'Mock Data\' }, { value: \'live\', label: \'Live API\' }]" />',
  }),
};

export const ThreeOptions: Story = {
  render: () => ({
    components: { SegmentedControl },
    setup() {
      return { value: ref('light') };
    },
    template: '<SegmentedControl v-model="value" :options="[{ value: \'light\', label: \'Light\' }, { value: \'dark\', label: \'Dark\' }, { value: \'system\', label: \'System\' }]" />',
  }),
};

export const Visibility: Story = {
  render: () => ({
    components: { SegmentedControl },
    setup() {
      return { value: ref('public') };
    },
    template: '<SegmentedControl v-model="value" :options="[{ value: \'public\', label: \'Public\' }, { value: \'unlisted\', label: \'Unlisted\' }, { value: \'private\', label: \'Private\' }]" />',
  }),
};
