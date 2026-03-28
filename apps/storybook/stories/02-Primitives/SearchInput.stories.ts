import type { Meta, StoryObj } from '@storybook/vue3';
import SearchInput from '@/components/ui/search-input/SearchInput.vue';
import { mediumDecorator } from '../decorators';

const meta = {
  title: '02-Primitives/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  decorators: [mediumDecorator],
  args: {
    modelValue: '',
    placeholder: 'Search',
  },
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
