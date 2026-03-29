import type { Meta, StoryObj } from '@storybook/vue3';
import {
  PhArrowLeft,
  PhArrowsClockwise,
  PhBell,
  PhBookmarkSimple,
  PhChat,
  PhDotsThree,
  PhGear,
  PhHeart,
  PhHouse,
  PhMagnifyingGlass,
  PhStar,
  PhUser,
} from '@phosphor-icons/vue';
import { defineComponent } from 'vue';

const IconShowcase = defineComponent({
  name: 'IconShowcase',
  components: { PhArrowLeft, PhArrowsClockwise, PhBell, PhBookmarkSimple, PhChat, PhDotsThree, PhGear, PhHeart, PhHouse, PhMagnifyingGlass, PhStar, PhUser },
  template: `
    <div class="max-w-[600px]">
      <p class="text-xs text-foreground/60 mb-4">Phosphor Icons · @phosphor-icons/vue · weight="regular" (default) / "fill" (active)</p>

      <div class="grid grid-cols-4 gap-6">
        <div v-for="icon in icons" :key="icon.name" class="flex flex-col items-center gap-2">
          <div class="flex gap-2">
            <component :is="icon.component" :size="24" weight="regular" class="text-foreground" />
            <component :is="icon.component" :size="24" weight="fill" class="text-foreground" />
          </div>
          <span class="text-xs text-foreground/60">{{ icon.name }}</span>
          <span class="text-xs text-foreground/40">{{ icon.usage }}</span>
        </div>
      </div>

      <div class="mt-8 flex items-end gap-4">
        <div class="flex flex-col items-center gap-1">
          <PhHeart :size="20" class="text-foreground" />
          <span class="text-xs text-foreground/60">20 · Actions</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <PhHeart :size="22" class="text-foreground" />
          <span class="text-xs text-foreground/60">22 · Nav</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <PhHeart :size="24" class="text-foreground" />
          <span class="text-xs text-foreground/60">24 · Back</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <PhHeart :size="32" class="text-foreground" />
          <span class="text-xs text-foreground/60">32 · Empty</span>
        </div>
      </div>
    </div>
  `,
  setup() {
    return {
      icons: [
        { name: 'PhHeart', component: PhHeart, usage: 'Like' },
        { name: 'PhChat', component: PhChat, usage: 'Reply' },
        { name: 'PhArrowsClockwise', component: PhArrowsClockwise, usage: 'Repost' },
        { name: 'PhBookmarkSimple', component: PhBookmarkSimple, usage: 'Save' },
        { name: 'PhDotsThree', component: PhDotsThree, usage: 'More' },
        { name: 'PhArrowLeft', component: PhArrowLeft, usage: 'Back' },
        { name: 'PhMagnifyingGlass', component: PhMagnifyingGlass, usage: 'Search' },
        { name: 'PhHouse', component: PhHouse, usage: 'Home' },
        { name: 'PhBell', component: PhBell, usage: 'Notifications' },
        { name: 'PhUser', component: PhUser, usage: 'Profile' },
        { name: 'PhGear', component: PhGear, usage: 'Settings' },
        { name: 'PhStar', component: PhStar, usage: 'Rating' },
      ],
    };
  },
});

const meta = {
  title: '01-Foundations/Icons',
  component: IconShowcase,
  tags: ['autodocs'],
} satisfies Meta<typeof IconShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllIcons: Story = {};
