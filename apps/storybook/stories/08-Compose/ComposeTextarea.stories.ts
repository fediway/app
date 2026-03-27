import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import ComposeTextarea from '@/components/compose/ComposeTextarea.vue';

const meta = {
  title: '08-Compose/ComposeTextarea',
  component: ComposeTextarea,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px; border: 1px solid var(--border); border-radius: 12px;"><story /></div>' })],
} satisfies Meta<typeof ComposeTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    placeholder: 'What\'s on your mind?',
    limit: 500,
    autofocus: true,
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Write the content behind the warning...',
    limit: 500,
  },
};

export const ShortLimit: Story = {
  args: {
    placeholder: 'Short post...',
    limit: 100,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Posting...',
    limit: 500,
    disabled: true,
  },
};

export const WithInitialContent: Story = {
  render: args => ({
    components: { ComposeTextarea },
    setup() {
      const editorRef = ref();
      const onMounted = () => {
        setTimeout(() => {
          editorRef.value?.setContent('@user@mastodon.social Hello! This is a reply with some initial content.');
        }, 100);
      };
      return { args, editorRef, onMounted };
    },
    template: `
      <ComposeTextarea
        ref="editorRef"
        v-bind="args"
        class="p-4"
        @vue:mounted="onMounted"
      />
    `,
  }),
  args: {
    placeholder: 'What\'s on your mind?',
    limit: 500,
  },
};
