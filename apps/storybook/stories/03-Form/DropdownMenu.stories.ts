import type { Meta, StoryObj } from '@storybook/vue3';
import { PhFlag, PhLink, PhPaperPlaneRight, PhProhibit, PhSpeakerSlash } from '@phosphor-icons/vue';
import { expect, userEvent, within } from '@storybook/test';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const meta = {
  title: '03-Form/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 400px; padding-top: 300px; display: flex; justify-content: center"><story /></div>' })],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: {
      Button,
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
      PhLink,
      PhPaperPlaneRight,
      PhSpeakerSlash,
      PhProhibit,
      PhFlag,
    },
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="secondary" size="sm">Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <PhLink :size="16" class="text-foreground/60" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem>
            <PhPaperPlaneRight :size="16" class="text-foreground/60" />
            Send as message
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <PhSpeakerSlash :size="16" class="text-foreground/60" />
            Mute user
          </DropdownMenuItem>
          <DropdownMenuItem>
            <PhProhibit :size="16" class="text-foreground/60" />
            Block user
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive>
            <PhFlag :size="16" />
            Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
};

export const WithLabel: Story = {
  render: () => ({
    components: {
      Button,
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    },
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="secondary" size="sm">Options</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>Edit profile</DropdownMenuItem>
          <DropdownMenuItem>Account settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Danger zone</DropdownMenuLabel>
          <DropdownMenuItem destructive>Delete account</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
};

export const Simple: Story = {
  render: () => ({
    components: {
      Button,
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
    },
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="muted" size="sm">···</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Share</DropdownMenuItem>
          <DropdownMenuItem>Copy link</DropdownMenuItem>
          <DropdownMenuItem>Embed</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
};

export const OpenAndNavigate: Story = {
  parameters: {
    docs: { description: { story: 'Tests that the dropdown opens on click and menu items are visible.' } },
  },
  render: () => ({
    components: { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger },
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="secondary" size="sm">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Menu should not be visible initially
    expect(canvas.queryByRole('menu')).not.toBeInTheDocument();

    // Click trigger to open
    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));

    // Menu should be visible with items
    const menu = within(document.body).getByRole('menu');
    expect(menu).toBeInTheDocument();
    expect(within(menu).getByText('Edit')).toBeInTheDocument();
    expect(within(menu).getByText('Duplicate')).toBeInTheDocument();
    expect(within(menu).getByText('Delete')).toBeInTheDocument();
  },
};

export const EscapeToDismiss: Story = {
  parameters: {
    docs: { description: { story: 'Tests that pressing Escape closes the dropdown menu.' } },
  },
  render: () => ({
    components: { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger },
    template: `
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="secondary" size="sm">Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Option A</DropdownMenuItem>
          <DropdownMenuItem>Option B</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open
    await userEvent.click(canvas.getByRole('button', { name: 'Menu' }));
    expect(within(document.body).getByRole('menu')).toBeInTheDocument();

    // Escape
    await userEvent.keyboard('{Escape}');

    // Closed
    await expect(within(document.body).queryByRole('menu')).not.toBeInTheDocument();
  },
};
