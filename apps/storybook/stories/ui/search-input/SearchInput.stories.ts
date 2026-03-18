import type { Meta, StoryObj } from '@storybook/vue3';
import SearchInput from '@/components/ui/search-input/SearchInput.vue';

const meta = {
  title: 'UI/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  args: {
    modelValue: '',
    placeholder: 'Search',
  },
  render: args => ({
    components: { SearchInput },
    setup() {
      return { args };
    },
    template: `
      <div style="max-width: 390px">
        <SearchInput v-bind="args" />
      </div>
    `,
  }),
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Suchen',
  },
};

export const WithValue: Story = {
  args: {
    modelValue: 'Dune',
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Search people, films, albums...',
  },
};
