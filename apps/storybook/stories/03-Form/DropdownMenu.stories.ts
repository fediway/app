import type { Meta, StoryObj } from '@storybook/vue3';
import { PhFlag, PhLink, PhPaperPlaneRight, PhProhibit, PhSpeakerSlash } from '@phosphor-icons/vue';
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
