import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { NavDrawer, NavDrawerItem, NavDrawerProfile } from '@/components/navigation';

const menuItems = [
  { id: 'home', icon: 'home', label: 'Home' },
  { id: 'explore', icon: 'explore', label: 'Explore' },
  { id: 'notifications', icon: 'notifications', label: 'Notifications' },
  { id: 'messages', icon: 'chat', label: 'Messages' },
  { id: 'favourites', icon: 'favourites', label: 'Favourites' },
  { id: 'saved', icon: 'saved', label: 'Saved' },
  { id: 'profile', icon: 'profile', label: 'Profile' },
  { id: 'settings', icon: 'settings', label: 'Settings' },
];

const meta = {
  title: '05-Navigation/NavDrawer',
  component: NavDrawer,
  tags: ['autodocs'],
} satisfies Meta<typeof NavDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { NavDrawer, NavDrawerItem, NavDrawerProfile },
    setup() {
      const open = ref(true);
      return { open, menuItems };
    },
    template: `
      <div>
        <button class="px-4 py-2 bg-gray-100 rounded-lg" @click="open = true">Open Drawer</button>
        <NavDrawer v-model:open="open">
          <template #header>
            <NavDrawerProfile
              avatar="https://i.pravatar.cc/150?u=jane"
              name="Jane Doe"
              handle="@jane@social.network"
            />
          </template>
          <NavDrawerItem
            v-for="item in menuItems"
            :key="item.id"
            :icon="item.icon"
            :label="item.label"
            :active="item.id === 'home'"
            @click="open = false"
          />
        </NavDrawer>
      </div>
    `,
  }),
};

export const WithBadge: Story = {
  render: () => ({
    components: { NavDrawer, NavDrawerItem, NavDrawerProfile },
    setup() {
      const open = ref(true);
      return { open, menuItems };
    },
    template: `
      <div>
        <button class="px-4 py-2 bg-gray-100 rounded-lg" @click="open = true">Open Drawer</button>
        <NavDrawer v-model:open="open">
          <template #header>
            <NavDrawerProfile
              avatar="https://i.pravatar.cc/150?u=jane"
              name="Jane Doe"
              handle="@jane@social.network"
            />
          </template>
          <NavDrawerItem
            v-for="item in menuItems"
            :key="item.id"
            :icon="item.icon"
            :label="item.label"
            :active="item.id === 'home'"
            :badge="item.id === 'notifications' ? 5 : item.id === 'messages' ? 2 : undefined"
            @click="open = false"
          />
        </NavDrawer>
      </div>
    `,
  }),
};

export const DarkMode: Story = {
  render: () => ({
    components: { NavDrawer, NavDrawerItem, NavDrawerProfile },
    setup() {
      const open = ref(true);
      return { open, menuItems };
    },
    template: `
      <div class="dark bg-gray-950 min-h-[400px]">
        <button class="px-4 py-2 bg-gray-800 text-white rounded-lg" @click="open = true">Open Drawer</button>
        <NavDrawer v-model:open="open">
          <template #header>
            <NavDrawerProfile
              avatar="https://i.pravatar.cc/150?u=jane"
              name="Jane Doe"
              handle="@jane@social.network"
            />
          </template>
          <NavDrawerItem
            v-for="item in menuItems"
            :key="item.id"
            :icon="item.icon"
            :label="item.label"
            :active="item.id === 'home'"
            @click="open = false"
          />
        </NavDrawer>
      </div>
    `,
  }),
};

export const NoHeader: Story = {
  render: () => ({
    components: { NavDrawer, NavDrawerItem },
    setup() {
      const open = ref(true);
      return { open, menuItems };
    },
    template: `
      <div>
        <button class="px-4 py-2 bg-gray-100 rounded-lg" @click="open = true">Open Drawer</button>
        <NavDrawer v-model:open="open">
          <NavDrawerItem
            v-for="item in menuItems"
            :key="item.id"
            :icon="item.icon"
            :label="item.label"
            :active="item.id === 'home'"
            @click="open = false"
          />
        </NavDrawer>
      </div>
    `,
  }),
};

export const RightSide: Story = {
  render: () => ({
    components: { NavDrawer, NavDrawerItem, NavDrawerProfile },
    setup() {
      const open = ref(true);
      return { open, menuItems };
    },
    template: `
      <div>
        <button class="px-4 py-2 bg-gray-100 rounded-lg" @click="open = true">Open Drawer</button>
        <NavDrawer v-model:open="open" side="right">
          <template #header>
            <NavDrawerProfile
              avatar="https://i.pravatar.cc/150?u=jane"
              name="Jane Doe"
              handle="@jane@social.network"
            />
          </template>
          <NavDrawerItem
            v-for="item in menuItems"
            :key="item.id"
            :icon="item.icon"
            :label="item.label"
            :active="item.id === 'home'"
            @click="open = false"
          />
        </NavDrawer>
      </div>
    `,
  }),
};
