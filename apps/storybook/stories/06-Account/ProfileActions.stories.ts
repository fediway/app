import type { Meta, StoryObj } from '@storybook/vue3';
import ProfileActions from '@/components/account/ProfileActions.vue';

const meta = {
  title: '06-Account/ProfileActions',
  component: ProfileActions,
  tags: ['autodocs'],
  argTypes: {
    following: { control: 'boolean' },
    requested: { control: 'boolean' },
    isOwnProfile: { control: 'boolean' },
  },
  args: {
    following: false,
    requested: false,
    isOwnProfile: false,
  },
} satisfies Meta<typeof ProfileActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Following: Story = {
  args: {
    following: true,
  },
};

export const Requested: Story = {
  args: {
    requested: true,
  },
};

export const OwnProfile: Story = {
  args: {
    isOwnProfile: true,
  },
};
