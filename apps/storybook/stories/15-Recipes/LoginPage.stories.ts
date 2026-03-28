import type { Meta, StoryObj } from '@storybook/vue3';
import { PhCircleNotch, PhGlobe } from '@phosphor-icons/vue';
import { defineComponent, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';

/**
 * Login page recipe — the branded splash/login screen as built from the Figma design.
 * Full-screen cream background with decorative SVG shapes, centered logo + action card.
 */
const LoginPageRecipe = defineComponent({
  name: 'LoginPageRecipe',
  components: { Button, InputGroup, InputGroupAddon, InputGroupInput, PhGlobe, PhCircleNotch },
  setup() {
    const instanceDomain = ref('mastodon.social');
    const isLoading = ref(false);
    return { instanceDomain, isLoading };
  },
  template: `
    <div class="relative flex min-h-[600px] flex-col bg-[#ede6d6] dark:bg-[#373442]">
      <!-- Logo -->
      <div class="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-12">
        <div class="mb-10 flex items-center gap-3">
          <div class="flex size-12 items-center justify-center rounded-xl bg-[#232b37]">
            <svg width="32" height="32" viewBox="0 0 57 57" fill="none">
              <path d="M17.064 21.349C18.459 19.943 20.049 18.699 21.798 17.477C11.984 19.078 7.012 29.038 12.772 37.497C11.823 31.077 12.15 26.009 17.06 21.345L17.064 21.349Z" fill="#E4A5BF"/>
              <path d="M39.458 34.758C38.137 36.194 36.624 37.478 34.898 38.693C44.114 37.268 49.448 26.554 43.923 18.673C44.88 24.893 43.875 30.153 39.462 34.762L39.458 34.758Z" fill="#94AAC7"/>
              <path d="M31.946 15.371C37.231 17.812 39.359 24.75 36.385 29.763C34.997 32.24 32.432 34.07 29.483 34.18C26.469 34.327 23.057 32.597 22.527 29.384C22.17 35.428 30.286 37.802 34.846 35.167C44.085 30.142 42.826 16.258 33.297 12.309C24.86 8.875 13.483 13.126 10.586 21.975C14.834 15.077 24.724 12.121 31.949 15.371H31.946Z" fill="#E3D4B3"/>
              <path d="M24.555 41.115C19.317 38.693 17.16 31.839 20.05 26.826C21.393 24.345 23.903 22.486 26.826 22.299C29.84 22.104 33.164 23.616 33.967 26.811C33.959 20.907 25.968 18.688 21.478 21.423C12.416 26.557 13.759 40.257 23.204 44.178C31.64 47.612 43.018 43.36 45.915 34.512C41.667 41.41 31.777 44.365 24.555 41.115Z" fill="#EDE6D6"/>
            </svg>
          </div>
          <span class="text-3xl font-bold text-[#232b37] dark:text-white">Fediway</span>
        </div>

        <!-- Action card -->
        <div class="w-full max-w-md rounded-3xl bg-[#fefeff] px-5 py-8 shadow-2xl dark:bg-[#232b37]">
          <InputGroup class="h-12 rounded-full">
            <InputGroupAddon>
              <PhGlobe :size="20" />
            </InputGroupAddon>
            <InputGroupInput
              v-model="instanceDomain"
              type="text"
              placeholder="Instance (e.g. mastodon.social)"
              class="h-12 text-base"
            />
          </InputGroup>

          <Button class="mt-4 w-full">Sign in</Button>
          <Button variant="secondary" class="mt-3 w-full">Continue with mock data</Button>

          <div class="mt-5 flex items-center justify-center gap-4 text-base">
            <a class="font-semibold text-foreground decoration-secondary underline underline-offset-2">Sign up</a>
            <span class="text-muted-foreground">&middot;</span>
            <a class="font-semibold text-foreground decoration-secondary underline underline-offset-2">Learn more</a>
          </div>
        </div>
      </div>
    </div>
  `,
});

const meta = {
  title: '15-Recipes/LoginPage',
  component: LoginPageRecipe,
} satisfies Meta<typeof LoginPageRecipe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile' },
  },
};
