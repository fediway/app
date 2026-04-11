<script setup lang="ts">
import type { EmojiSuggestion } from './EmojiList.vue';
import { PhMagnifyingGlass, PhSmiley } from '@phosphor-icons/vue';
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui';
import { computed, ref } from 'vue';

interface Props {
  /** All available emoji (custom + unicode), grouped by category */
  emoji: EmojiSuggestion[];
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  select: [emoji: string];
}>();

const isOpen = ref(false);
const search = ref('');
const searchInputRef = ref<HTMLInputElement>();

// Group emoji by category
const categories = computed(() => {
  const map = new Map<string, EmojiSuggestion[]>();
  for (const e of props.emoji) {
    const cat = e.category || 'Custom';
    if (!map.has(cat))
      map.set(cat, []);
    map.get(cat)!.push(e);
  }
  return map;
});

// Filtered by search
const filteredEmoji = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q)
    return null;
  return props.emoji.filter(e =>
    e.shortcode.toLowerCase().includes(q),
  );
});

function handleSelect(emoji: EmojiSuggestion) {
  if (emoji.native) {
    emit('select', emoji.native);
  }
  else if (emoji.url) {
    emit('select', `:${emoji.shortcode}:`);
  }
  isOpen.value = false;
}

function handleOpenChange(open: boolean) {
  isOpen.value = open;
  if (open) {
    search.value = '';
    setTimeout(() => searchInputRef.value?.focus(), 50);
  }
}
</script>

<template>
  <PopoverRoot :open="isOpen" @update:open="handleOpenChange">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors"
        :class="[
          isOpen
            ? 'bg-primary text-primary-foreground'
            : disabled
              ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
              : 'bg-muted text-foreground hover:bg-accent',
        ]"
        :disabled="disabled"
        aria-label="Insert emoji"
      >
        <PhSmiley :size="16" />
      </button>
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        side="top"
        align="start"
        :side-offset="8"
        class="z-50 w-72 overflow-hidden rounded-xl border border-border bg-card shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        @open-auto-focus.prevent
      >
        <!-- Search -->
        <div class="border-b border-border p-2">
          <div class="flex items-center gap-2 rounded-lg bg-muted px-2.5 py-1.5">
            <PhMagnifyingGlass :size="16" class="shrink-0 text-muted-foreground" />
            <input
              ref="searchInputRef"
              v-model="search"
              type="text"
              placeholder="Search emoji..."
              class="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            >
          </div>
        </div>

        <!-- Emoji grid -->
        <div class="max-h-64 overflow-y-auto p-2">
          <!-- Search results -->
          <template v-if="filteredEmoji">
            <div v-if="filteredEmoji.length === 0" class="py-6 text-center text-sm text-muted-foreground">
              No emoji found
            </div>
            <div v-else class="grid grid-cols-8 gap-0.5">
              <button
                v-for="e in filteredEmoji"
                :key="e.shortcode"
                type="button"
                class="flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-accent"
                :title="`:${e.shortcode}:`"
                @click="handleSelect(e)"
              >
                <img v-if="e.url" :src="e.url" :alt="e.shortcode" class="size-5 object-contain" loading="lazy" decoding="async">
                <span v-else-if="e.native" class="text-lg">{{ e.native }}</span>
              </button>
            </div>
          </template>

          <!-- Categorized browse -->
          <template v-else>
            <div v-if="emoji.length === 0" class="py-6 text-center text-sm text-muted-foreground">
              No custom emoji available
            </div>
            <div v-for="[category, emojis] in categories" v-else :key="category" class="mb-3 last:mb-0">
              <div class="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {{ category }}
              </div>
              <div class="grid grid-cols-8 gap-0.5">
                <button
                  v-for="e in emojis"
                  :key="e.shortcode"
                  type="button"
                  class="flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-accent"
                  :title="`:${e.shortcode}:`"
                  @click="handleSelect(e)"
                >
                  <img v-if="e.url" :src="e.url" :alt="e.shortcode" class="size-5 object-contain" loading="lazy" decoding="async">
                  <span v-else-if="e.native" class="text-lg">{{ e.native }}</span>
                </button>
              </div>
            </div>
          </template>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
