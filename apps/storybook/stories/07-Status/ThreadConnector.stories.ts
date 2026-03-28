import type { Meta, StoryObj } from '@storybook/vue3';
import ThreadConnector from '@/components/status/ThreadConnector.vue';

const meta = {
  title: '07-Status/ThreadConnector',
  component: ThreadConnector,
  tags: ['autodocs'],
} satisfies Meta<typeof ThreadConnector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { ThreadConnector },
    template: `
      <div class="relative h-20" style="max-width: 600px">
        <ThreadConnector class="top-0 bottom-0" />
      </div>
    `,
  }),
};

export const Short: Story = {
  render: () => ({
    components: { ThreadConnector },
    template: `
      <div class="relative h-8" style="max-width: 600px">
        <ThreadConnector class="top-0 bottom-0" />
      </div>
    `,
  }),
};

export const Long: Story = {
  render: () => ({
    components: { ThreadConnector },
    template: `
      <div class="relative h-60" style="max-width: 600px">
        <ThreadConnector class="top-0 bottom-0" />
      </div>
    `,
  }),
};
