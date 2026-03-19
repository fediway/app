import type { Meta, StoryObj } from '@storybook/vue3';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';

const meta = {
  title: '03-Form/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAddonStart: Story = {
  render: () => ({
    components: { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText },
    template: `
      <InputGroup class="w-[380px]">
        <InputGroupAddon align="inline-start">
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
      </InputGroup>
    `,
  }),
};

export const WithAddonEnd: Story = {
  render: () => ({
    components: { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText },
    template: `
      <InputGroup class="w-[380px]">
        <InputGroupInput placeholder="Username" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>@gmail.com</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    `,
  }),
};

export const WithBothAddons: Story = {
  render: () => ({
    components: { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText },
    template: `
      <InputGroup class="w-[380px]">
        <InputGroupAddon align="inline-start">
          <InputGroupText>$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="0.00" type="number" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>USD</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    `,
  }),
};

export const WithButton: Story = {
  render: () => ({
    components: { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton },
    template: `
      <InputGroup class="w-[380px]">
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon align="inline-end">
          <InputGroupButton>Search</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    `,
  }),
};

export const WithTextarea: Story = {
  render: () => ({
    components: { InputGroup, InputGroupAddon, InputGroupTextarea, InputGroupButton },
    template: `
      <InputGroup class="w-[380px]">
        <InputGroupTextarea placeholder="Type a message..." />
        <InputGroupAddon align="block-end">
          <InputGroupButton>Send</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea },
    template: `
      <div class="flex flex-col gap-6 w-[380px]">
        <div>
          <p class="text-sm text-muted-foreground mb-2">Inline-start addon</p>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText>https://</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder="example.com" />
          </InputGroup>
        </div>

        <div>
          <p class="text-sm text-muted-foreground mb-2">Inline-end addon</p>
          <InputGroup>
            <InputGroupInput placeholder="Username" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>@gmail.com</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div>
          <p class="text-sm text-muted-foreground mb-2">Both addons</p>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText>$</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder="0.00" type="number" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>USD</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div>
          <p class="text-sm text-muted-foreground mb-2">With button</p>
          <InputGroup>
            <InputGroupInput placeholder="Search..." />
            <InputGroupAddon align="inline-end">
              <InputGroupButton>Go</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div>
          <p class="text-sm text-muted-foreground mb-2">Block-end addon with textarea</p>
          <InputGroup>
            <InputGroupTextarea placeholder="Type a message..." />
            <InputGroupAddon align="block-end">
              <InputGroupButton>Send</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    `,
  }),
};
