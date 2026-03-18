import type { Meta, StoryObj } from '@storybook/vue3';
import StatusDetailMain from '@/components/status/StatusDetailMain.vue';
import { createMockStatus } from '../../mocks';

const meta = {
  title: '07-Status/StatusDetailMain',
  component: StatusDetailMain,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px"><story /></div>' })],
} satisfies Meta<typeof StatusDetailMain>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { status: createMockStatus() },
};

export const WithTags: Story = {
  args: {
    status: createMockStatus({
      content: '<p>Working on a new Vue 3 project with Tailwind CSS</p>',
      tags: [
        { name: 'vue', url: 'https://mastodon.social/tags/vue', history: [] },
        { name: 'tailwindcss', url: 'https://mastodon.social/tags/tailwindcss', history: [] },
      ],
    }),
  },
};

export const HighEngagement: Story = {
  args: {
    status: createMockStatus({
      reblogsCount: 342,
      favouritesCount: 1580,
      repliesCount: 47,
    }),
  },
};
