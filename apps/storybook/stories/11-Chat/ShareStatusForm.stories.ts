import type { Meta, StoryObj } from '@storybook/vue3';
import ShareStatusForm from '@/components/chat/ShareStatusForm.vue';
import { createMockAccount, createMockStatus } from '../../mocks';

const mockAccounts = [
  createMockAccount({ displayName: 'Sarah Chen', username: 'sarah', acct: 'sarah@social.network' }),
  createMockAccount({ displayName: 'Marcus Johnson', username: 'marcus.j', acct: 'marcus.j@federated.social' }),
  createMockAccount({ displayName: 'Emily Rodriguez', username: 'emily_r', acct: 'emily_r@mastodon.social' }),
  createMockAccount({ displayName: 'Alex Rivera', username: 'alex', acct: 'alex@fosstodon.org' }),
  createMockAccount({ displayName: 'Jordan Kim', username: 'jordankim', acct: 'jordankim@hachyderm.io' }),
];

const mockStatus = createMockStatus({
  content: '<p>Just shipped the new component library! Really happy with how the design tokens turned out. Check it out and let me know what you think.</p>',
});

const meta = {
  title: '11-Chat/ShareStatusForm',
  component: ShareStatusForm,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 480px; border: 1px solid var(--color-border); border-radius: 16px; overflow: hidden"><story /></div>' })],
} satisfies Meta<typeof ShareStatusForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: mockStatus,
    accounts: mockAccounts,
  },
};

export const WithMediaStatus: Story = {
  args: {
    status: createMockStatus({
      content: '<p>Golden hour at the beach. Sometimes the best photos happen when you least expect them.</p>',
      mediaAttachments: [{
        id: '1',
        type: 'image',
        url: 'https://picsum.photos/seed/beach/800/600',
        previewUrl: 'https://picsum.photos/seed/beach/400/300',
        description: 'Beach at sunset',
      }] as any,
    }),
    accounts: mockAccounts,
  },
};
