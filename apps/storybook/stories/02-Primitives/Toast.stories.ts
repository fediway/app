import type { Meta, StoryObj } from '@storybook/vue3';
import { Button } from '@/components/ui/button';
import { ToastContainer, useToast } from '@/components/ui/toast';

const meta = {
  title: '02-Primitives/Toast',
  component: ToastContainer,
  tags: ['autodocs'],
} satisfies Meta<typeof ToastContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { ToastContainer, Button },
    setup() {
      const { toast } = useToast();
      return { toast };
    },
    template: `
      <div class="flex flex-wrap gap-2">
        <Button size="sm" @click="toast('Post published')">Default toast</Button>
        <Button size="sm" @click="toast.success('Post published', 'Your post is now visible to everyone.')">Success</Button>
        <Button size="sm" @click="toast.error('Failed to post', 'Please check your connection and try again.')">Error</Button>
        <ToastContainer />
      </div>
    `,
  }),
};

export const Success: Story = {
  render: () => ({
    components: { ToastContainer, Button },
    setup() {
      const { toast } = useToast();
      return { toast };
    },
    template: `
      <div class="flex flex-wrap gap-2">
        <Button size="sm" @click="toast.success('Followed @sarah')">Follow</Button>
        <Button size="sm" @click="toast.success('Post bookmarked')">Bookmark</Button>
        <Button size="sm" @click="toast.success('Link copied')">Copy link</Button>
        <Button size="sm" @click="toast.success('Message sent', 'Your message was delivered.')">Send message</Button>
        <ToastContainer />
      </div>
    `,
  }),
};

export const Error: Story = {
  render: () => ({
    components: { ToastContainer, Button },
    setup() {
      const { toast } = useToast();
      return { toast };
    },
    template: `
      <div class="flex flex-wrap gap-2">
        <Button size="sm" @click="toast.error('Failed to follow')">Follow error</Button>
        <Button size="sm" @click="toast.error('Network error', 'Check your connection.')">Network error</Button>
        <ToastContainer />
      </div>
    `,
  }),
};

export const Stacked: Story = {
  render: () => ({
    components: { ToastContainer, Button },
    setup() {
      const { toast } = useToast();
      function fireMultiple() {
        toast.success('Post liked');
        setTimeout(() => toast.success('Post bookmarked'), 300);
        setTimeout(() => toast('Link copied to clipboard'), 600);
      }
      return { fireMultiple };
    },
    template: `
      <div>
        <Button size="sm" @click="fireMultiple">Fire 3 toasts</Button>
        <ToastContainer />
      </div>
    `,
  }),
};
