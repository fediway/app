import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, within } from '@storybook/test';
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const meta = {
  title: '04-Layout/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    showClose: {
      control: 'boolean',
    },
    fullScreenMobile: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose, Button },
    template: `
      <Dialog>
        <DialogTrigger>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div class="p-6">
            <p class="text-sm text-foreground/80">Dialog body content goes here.</p>
          </div>
          <DialogFooter>
            <DialogClose>
              <Button variant="muted" size="sm">Cancel</Button>
            </DialogClose>
            <Button size="sm">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
};

export const Controlled: Story = {
  render: () => ({
    components: { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, Button },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <div>
        <Button @click="open = true">Open controlled dialog</Button>
        <Dialog v-model:open="open">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Controlled dialog</DialogTitle>
              <DialogDescription>This dialog is controlled via v-model:open.</DialogDescription>
            </DialogHeader>
            <div class="p-6">
              <p class="text-sm text-foreground/80">The parent controls when this opens and closes.</p>
            </div>
            <DialogFooter>
              <Button size="sm" @click="open = false">Got it</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    `,
  }),
};

export const DestructiveConfirmation: Story = {
  render: () => ({
    components: { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose, Button },
    template: `
      <Dialog>
        <DialogTrigger>
          <Button variant="secondary" class="border-red-200 text-red-600">Delete account</Button>
        </DialogTrigger>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>This action cannot be undone. This will permanently delete your account and remove all your data.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>
              <Button variant="muted" size="sm">Cancel</Button>
            </DialogClose>
            <Button size="sm" class="bg-red-600 text-white hover:bg-red-700">Delete account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
};

export const WithForm: Story = {
  render: () => ({
    components: { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose, Button, Input },
    template: `
      <Dialog>
        <DialogTrigger>
          <Button>Change display name</Button>
        </DialogTrigger>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Display name</DialogTitle>
            <DialogDescription>This is how others will see you.</DialogDescription>
          </DialogHeader>
          <div class="px-6 py-4">
            <Input placeholder="Enter your display name" />
          </div>
          <DialogFooter>
            <DialogClose>
              <Button variant="muted" size="sm">Cancel</Button>
            </DialogClose>
            <Button size="sm">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
};

export const Large: Story = {
  render: () => ({
    components: { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose, Button },
    template: `
      <Dialog>
        <DialogTrigger>
          <Button>Open large dialog</Button>
        </DialogTrigger>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Compose post</DialogTitle>
          </DialogHeader>
          <div class="p-6">
            <div class="min-h-[200px] rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Compose area would go here...
            </div>
          </div>
          <DialogFooter>
            <DialogClose>
              <Button variant="muted" size="sm">Cancel</Button>
            </DialogClose>
            <Button size="sm">Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
};

export const OpenAndClose: Story = {
  parameters: {
    docs: { description: { story: 'Tests that the dialog opens on trigger click and closes via Cancel.' } },
  },
  render: () => ({
    components: { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose, Button },
    template: `
      <Dialog>
        <DialogTrigger>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>
              <Button variant="muted" size="sm">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Open Dialog' }));

    const dialog = within(document.body).getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument();
  },
};

export const EscapeToClose: Story = {
  parameters: {
    docs: { description: { story: 'Tests that pressing Escape closes the dialog.' } },
  },
  render: () => ({
    components: { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Button },
    template: `
      <Dialog>
        <DialogTrigger>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escape Test</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open Dialog' }));
    expect(within(document.body).getByRole('dialog')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    await expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument();
  },
};
