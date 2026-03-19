import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TabBar } from '@/components/navigation/tab-bar';

const defaultTabs = [
  { label: 'All', value: 'all' },
  { label: 'Posts', value: 'posts' },
  { label: 'Takes', value: 'takes' },
  { label: 'Replies', value: 'replies' },
  { label: 'Likes', value: 'likes' },
  { label: 'Media', value: 'media' },
];

const meta = {
  title: '05-Navigation/TabBar',
  component: TabBar,
  tags: ['autodocs'],
  args: {
    tabs: defaultTabs,
    modelValue: 'all',
  },
  render: args => ({
    components: { TabBar },
    setup() {
      const active = ref(args.modelValue ?? 'all');
      return { args, active };
    },
    template: '<TabBar :tabs="args.tabs" v-model="active" />',
  }),
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SecondTabActive: Story = {
  args: { modelValue: 'posts' },
};

export const Overflow: Story = {
  render: () => ({
    components: { TabBar },
    setup() {
      const active = ref('all');
      const tabs = [
        { label: 'All', value: 'all' },
        { label: 'Posts', value: 'posts' },
        { label: 'Takes', value: 'takes' },
        { label: 'Replies', value: 'replies' },
        { label: 'Likes', value: 'likes' },
        { label: 'Media', value: 'media' },
        { label: 'Mentions', value: 'mentions' },
        { label: 'Bookmarks', value: 'bookmarks' },
        { label: 'Reposts', value: 'reposts' },
      ];
      return { active, tabs };
    },
    template: `
      <div style="max-width: 375px; border: 1px dashed #ccc;">
        <TabBar :tabs="tabs" v-model="active" />
        <p style="padding: 8px; font-size: 12px; color: #666;">Active: {{ active }}</p>
      </div>
    `,
  }),
};

export const Interactive: Story = {
  render: () => ({
    components: { TabBar },
    setup() {
      const active = ref('all');
      return { active, tabs: defaultTabs };
    },
    template: `
      <div>
        <TabBar :tabs="tabs" v-model="active" />
        <p style="padding: 12px; font-size: 14px;">Active tab: <strong>{{ active }}</strong></p>
      </div>
    `,
  }),
};
