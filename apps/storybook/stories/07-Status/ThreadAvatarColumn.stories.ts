import type { Meta, StoryObj } from '@storybook/vue3';
import ThreadAvatarColumn from '@/components/status/ThreadAvatarColumn.vue';

const meta = {
  title: '07-Status/ThreadAvatarColumn',
  component: ThreadAvatarColumn,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The single layout primitive that owns the avatar + thread rails '
          + 'for a status row. Drop it into any `flex gap-3` row as the '
          + 'left column — it handles the avatar, the rail above, the rail '
          + 'below, and the self-stretch behavior internally. Callers never '
          + 'touch flex-column layout, rail segments, or the `bg-border` token.',
      },
    },
  },
} satisfies Meta<typeof ThreadAvatarColumn>;

export default meta;
type Story = StoryObj<typeof meta>;

function wrap(inner: string): string {
  return `
    <div class="flex px-4 bg-background" style="max-width: 600px">
      ${inner}
      <div class="min-w-0 flex-1 py-3 text-sm text-muted-foreground">
        Sample content column. Rails stretch to match this column's height.
      </div>
    </div>
  `;
}

export const Standalone: Story = {
  name: 'Standalone (no rails)',
  args: { connectAbove: false, connectBelow: false },
  render: args => ({
    components: { ThreadAvatarColumn },
    setup: () => ({ args }),
    template: wrap(
      '<ThreadAvatarColumn v-bind="args" />',
    ),
  }),
};

export const ChainStart: Story = {
  name: 'Chain start (rail below)',
  args: { connectAbove: false, connectBelow: true },
  render: args => ({
    components: { ThreadAvatarColumn },
    setup: () => ({ args }),
    template: wrap('<ThreadAvatarColumn v-bind="args" />'),
  }),
};

export const ChainMiddle: Story = {
  name: 'Chain middle (rail above + below)',
  args: { connectAbove: true, connectBelow: true },
  render: args => ({
    components: { ThreadAvatarColumn },
    setup: () => ({ args }),
    template: wrap('<ThreadAvatarColumn v-bind="args" />'),
  }),
};

export const ChainEnd: Story = {
  name: 'Chain end (rail above)',
  args: { connectAbove: true, connectBelow: false },
  render: args => ({
    components: { ThreadAvatarColumn },
    setup: () => ({ args }),
    template: wrap('<ThreadAvatarColumn v-bind="args" />'),
  }),
};

export const ContinuousChain: Story = {
  name: 'Continuous chain (3 stacked rows)',
  parameters: {
    docs: {
      description: {
        story:
          'Three rows stacked with no inter-row spacing. Verify the rail is '
          + 'continuous from the first avatar\'s bottom to the last avatar\'s top.',
      },
    },
  },
  render: () => ({
    components: { ThreadAvatarColumn },
    template: `
      <div class="bg-background" style="max-width: 600px">
        <div class="flex px-4">
          <ThreadAvatarColumn :connect-below="true" />
          <div class="min-w-0 flex-1 py-3 text-sm text-muted-foreground">Row 1 — chain-start</div>
        </div>
        <div class="flex px-4">
          <ThreadAvatarColumn :connect-above="true" :connect-below="true" />
          <div class="min-w-0 flex-1 py-3 text-sm text-muted-foreground">Row 2 — chain-middle</div>
        </div>
        <div class="flex px-4">
          <ThreadAvatarColumn :connect-above="true" />
          <div class="min-w-0 flex-1 py-3 text-sm text-muted-foreground">Row 3 — chain-end</div>
        </div>
      </div>
    `,
  }),
};

export const LongContent: Story = {
  name: 'Long content (rail stretches)',
  render: () => ({
    components: { ThreadAvatarColumn },
    template: `
      <div class="flex px-4 bg-background" style="max-width: 600px">
        <ThreadAvatarColumn :connect-below="true" />
        <div class="min-w-0 flex-1 py-3 text-sm text-foreground">
          ${'Long content that wraps across many lines to force the rail below the avatar to stretch. '.repeat(12)}
        </div>
      </div>
    `,
  }),
};
