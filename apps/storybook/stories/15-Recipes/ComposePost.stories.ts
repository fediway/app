import type { Meta, StoryObj } from '@storybook/vue3';
import { defineComponent, ref } from 'vue';
import { CharacterCounter } from '@/components/compose/CharacterCounter.vue';
import ComposeToolbar from '@/components/compose/ComposeToolbar.vue';
import ContentWarningToggle from '@/components/compose/ContentWarningToggle.vue';
import MediaPreviewGrid from '@/components/compose/MediaPreviewGrid.vue';
import PollEditor from '@/components/compose/PollEditor.vue';
import ReplyContext from '@/components/compose/ReplyContext.vue';
import VisibilitySelector from '@/components/compose/VisibilitySelector.vue';
import { Button } from '@/components/ui/button';
import { wideDecorator } from '../decorators';

/**
 * Full compose post recipe — demonstrates the complete post creation flow
 * as it appears in PostComposerModal (without the Dialog wrapper).
 */
const ComposePostRecipe = defineComponent({
  name: 'ComposePostRecipe',
  components: { Button, CharacterCounter, ComposeToolbar, ContentWarningToggle, MediaPreviewGrid, PollEditor, ReplyContext, VisibilitySelector },
  props: {
    replyTo: { type: String, default: '' },
  },
  setup(props) {
    const content = ref(props.replyTo ? `@${props.replyTo} ` : '');
    const spoilerText = ref('');
    const showContentWarning = ref(false);
    const showPoll = ref(false);
    const visibility = ref<string>('public');
    const pollOptions = ref(['', '']);
    const pollDuration = ref(86400);
    const pollMultiple = ref(false);

    const media = ref([
      { previewUrl: 'https://picsum.photos/seed/compose1/400/300', altText: 'A sunset over the ocean', progress: 100, status: 'complete' as const, type: 'image' as const },
      { previewUrl: 'https://picsum.photos/seed/compose2/400/300', altText: '', progress: 100, status: 'complete' as const, type: 'image' as const },
    ]);

    const characterCount = ref(content.value.length);
    const limit = 500;

    const canPost = ref(true);

    return {
      content,
      spoilerText,
      showContentWarning,
      showPoll,
      visibility,
      pollOptions,
      pollDuration,
      pollMultiple,
      media,
      characterCount,
      limit,
      canPost,
    };
  },
  template: `
    <div class="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
      <!-- Header -->
      <header class="flex items-center justify-between border-b border-border px-4 py-3">
        <Button variant="muted" size="sm">Cancel</Button>
        <div class="flex items-center gap-3">
          <span class="text-xs text-muted-foreground/70">Draft saved</span>
          <Button size="sm" :disabled="!canPost">Post</Button>
        </div>
      </header>

      <!-- Reply context -->
      <ReplyContext v-if="replyTo" :acct="replyTo" class="px-4 pt-3" />

      <!-- CW input -->
      <div v-if="showContentWarning" class="px-4 pt-3">
        <input
          v-model="spoilerText"
          class="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-ring"
          placeholder="Write your warning here"
        >
      </div>

      <!-- Editor area -->
      <div class="p-4">
        <textarea
          v-model="content"
          class="min-h-[150px] w-full resize-none border-none bg-transparent p-0 text-lg leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
          :placeholder="showContentWarning ? 'Write the content behind the warning...' : 'What\\'s on your mind?'"
          @input="characterCount = content.length"
        />
      </div>

      <!-- Media preview -->
      <MediaPreviewGrid
        v-if="media.length > 0"
        :media="media"
        class="px-4 pb-3"
      />

      <!-- Poll editor -->
      <div v-if="showPoll" class="px-4 pb-3">
        <PollEditor
          :options="pollOptions"
          :duration="pollDuration"
          :multiple="pollMultiple"
          @update:options="pollOptions = $event"
          @update:duration="pollDuration = $event"
          @update:multiple="pollMultiple = $event"
        />
      </div>

      <!-- Toolbar -->
      <div class="border-t border-border px-4 py-3">
        <div class="mb-4">
          <label class="mb-2 block text-xs font-medium text-muted-foreground">Visibility</label>
          <VisibilitySelector v-model="visibility" />
        </div>
        <div class="flex items-center justify-between">
          <ComposeToolbar
            :show-content-warning="showContentWarning"
            :show-poll="showPoll"
            :disable-poll="media.length > 0"
            :disable-media="showPoll"
            @update:show-content-warning="showContentWarning = $event"
            @toggle-poll="showPoll = !showPoll"
          />
          <CharacterCounter :current="characterCount" :limit="limit" />
        </div>
      </div>
    </div>
  `,
});

const meta = {
  title: '15-Recipes/ComposePost',
  component: ComposePostRecipe,
  decorators: [wideDecorator],
} satisfies Meta<typeof ComposePostRecipe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Reply: Story = {
  args: { replyTo: 'alice@mastodon.social' },
};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile' },
    docs: { description: { story: 'The compose modal on mobile takes full screen with safe-area padding.' } },
  },
};
