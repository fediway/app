import type { Meta, StoryObj } from '@storybook/vue3';
import { PhPlus } from '@phosphor-icons/vue';
import { SideNav, SideNavItem, SideNavProfile } from '@/components/navigation';
import { Button } from '@/components/ui/button';

const menuItems = [
  { id: 'home', icon: 'home', label: 'Home' },
  { id: 'explore', icon: 'explore', label: 'Explore' },
  { id: 'notifications', icon: 'notifications', label: 'Notifications' },
  { id: 'messages', icon: 'chat', label: 'Messages' },
  { id: 'favourites', icon: 'favourites', label: 'Likes' },
  { id: 'saved', icon: 'saved', label: 'Saved' },
  { id: 'profile', icon: 'profile', label: 'Profile' },
  { id: 'settings', icon: 'settings', label: 'Settings' },
];

const meta = {
  title: '05-Navigation/SideNav',
  component: SideNav,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="width: 240px"><story /></div>' })],
} satisfies Meta<typeof SideNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { SideNav, SideNavItem, SideNavProfile, Button, PhPlus },
    setup() {
      return { menuItems };
    },
    template: `
      <SideNav>
        <template #profile>
          <SideNavProfile
            avatar="https://i.pravatar.cc/150?u=jane"
            name="Jane Doe"
            handle="@jane@social.network"
          />
        </template>
        <template #action>
          <Button class="w-full py-3 text-[15px]">
            <PhPlus :size="20" />
            <span>New Post</span>
          </Button>
        </template>
        <SideNavItem
          v-for="item in menuItems"
          :key="item.id"
          :icon="item.icon"
          :label="item.label"
          :active="item.id === 'home'"
        />
      </SideNav>
    `,
  }),
};

export const WithBadge: Story = {
  render: () => ({
    components: { SideNav, SideNavItem, SideNavProfile, Button, PhPlus },
    setup() {
      return { menuItems };
    },
    template: `
      <SideNav>
        <template #profile>
          <SideNavProfile
            avatar="https://i.pravatar.cc/150?u=jane"
            name="Jane Doe"
            handle="@jane@social.network"
          />
        </template>
        <template #action>
          <Button class="w-full py-3 text-[15px]">
            <PhPlus :size="20" />
            <span>New Post</span>
          </Button>
        </template>
        <SideNavItem
          v-for="item in menuItems"
          :key="item.id"
          :icon="item.icon"
          :label="item.label"
          :active="item.id === 'home'"
          :badge="item.id === 'notifications' ? 42 : undefined"
        />
      </SideNav>
    `,
  }),
};

export const WithoutAction: Story = {
  render: () => ({
    components: { SideNav, SideNavItem, SideNavProfile },
    setup() {
      return { menuItems };
    },
    template: `
      <SideNav>
        <template #profile>
          <SideNavProfile
            avatar="https://i.pravatar.cc/150?u=jane"
            name="Jane Doe"
            handle="@jane@social.network"
          />
        </template>
        <SideNavItem
          v-for="item in menuItems"
          :key="item.id"
          :icon="item.icon"
          :label="item.label"
          :active="item.id === 'home'"
        />
      </SideNav>
    `,
  }),
};

export const DarkMode: Story = {
  render: () => ({
    components: { SideNav, SideNavItem, SideNavProfile, Button, PhPlus },
    setup() {
      return { menuItems };
    },
    template: `
      <div class="dark bg-gray-950 p-4 rounded-lg">
        <SideNav>
          <template #profile>
            <SideNavProfile
              avatar="https://i.pravatar.cc/150?u=jane"
              name="Jane Doe"
              handle="@jane@social.network"
            />
          </template>
          <template #action>
            <Button class="w-full py-3 text-[15px]">
              <PhPlus :size="20" />
              <span>New Post</span>
            </Button>
          </template>
          <SideNavItem
            v-for="item in menuItems"
            :key="item.id"
            :icon="item.icon"
            :label="item.label"
            :active="item.id === 'home'"
          />
        </SideNav>
      </div>
    `,
  }),
};
