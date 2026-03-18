import type { Meta, StoryObj } from '@storybook/vue3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const meta = {
  title: '4-Layout/Card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button },
    template: `
      <Card class="w-[380px]">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description with supporting text.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card content goes here. This is where the main body of the card lives.</p>
        </CardContent>
        <CardFooter class="justify-end gap-2">
          <Button variant="muted">Cancel</Button>
          <Button>Save</Button>
        </CardFooter>
      </Card>
    `,
  }),
};

export const Simple: Story = {
  render: () => ({
    components: { Card, CardContent },
    template: `
      <Card class="w-[380px]">
        <CardContent class="pt-6">
          <p>A simple card with just content and no header or footer.</p>
        </CardContent>
      </Card>
    `,
  }),
};

export const WithFooter: Story = {
  render: () => ({
    components: { Card, CardContent, CardFooter, Button },
    template: `
      <Card class="w-[380px]">
        <CardContent class="pt-6">
          <p>Card with content and a footer action.</p>
        </CardContent>
        <CardFooter>
          <Button class="w-full">Continue</Button>
        </CardFooter>
      </Card>
    `,
  }),
};
