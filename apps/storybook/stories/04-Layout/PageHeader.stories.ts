import type { Meta, StoryObj } from '@storybook/vue3';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { wideDecorator } from '../decorators';

const meta = {
  title: '04-Layout/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  decorators: [wideDecorator],
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Notifications',
  },
};

export const WithBack: Story = {
  args: {
    title: 'Post',
    showBack: true,
  },
};

export const WithSubtitle: Story = {
  args: {
    title: '#photography',
    subtitle: '2,453 posts',
    showBack: true,
  },
};

export const WithActions: Story = {
  render: () => ({
    components: { PageHeader, Button },
    template: `
      <PageHeader title="Messages">
        <template #actions>
          <Button size="sm" variant="muted">New</Button>
        </template>
      </PageHeader>
    `,
  }),
};
