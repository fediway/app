<script setup lang="ts">
import { PhArrowsOut, PhPaperPlaneRight } from '@phosphor-icons/vue';
import { computed, nextTick, ref, watch } from 'vue';
import Avatar from '../ui/avatar/Avatar.vue';
import Button from '../ui/button/Button.vue';

interface Props {
  /** Current user's avatar URL */
  avatarSrc?: string;
  /** Current user's display name (for alt text) */
  avatarAlt?: string;
  /** The @acct being replied to (shown as placeholder context) */
  replyToAcct?: string;
  /** Max character limit */
  maxLength?: number;
  /** Disable the input (e.g. when not authenticated) */
  disabled?: boolean;
  /** Submitting state */
  submitting?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  avatarSrc: undefined,
  avatarAlt: 'Your avatar',
  replyToAcct: undefined,
  maxLength: 500,
  disabled: false,
  submitting: false,
});

const emit = defineEmits<{
  /** Quick reply submitted with text content */
  submit: [content: string];
  /** User wants to expand to full compose modal */
  expand: [];
}>();

const content = ref('');
const textareaRef = ref<HTMLTextAreaElement>();
const isFocused = ref(false);

const placeholder = computed(() =>
  props.replyToAcct
    ? `Reply to @${props.replyToAcct}...`
    : 'Write a reply...',
);

const charCount = computed(() => content.value.length);
const isOverLimit = computed(() => charCount.value > props.maxLength);
const canSubmit = computed(() =>
  content.value.trim().length > 0
  && !isOverLimit.value
  && !props.submitting
  && !props.disabled,
);

function handleFocus() {
  isFocused.value = true;
}

function handleBlur() {
  // Delay blur to allow button clicks to register
  setTimeout(() => {
    if (!content.value.trim()) {
      isFocused.value = false;
    }
  }, 150);
}

function handleSubmit() {
  if (!canSubmit.value)
    return;
  emit('submit', content.value.trim());
  content.value = '';
  isFocused.value = false;
}

function handleKeydown(e: KeyboardEvent) {
  // Cmd/Ctrl+Enter to submit
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    handleSubmit();
  }
}

function handleExpand() {
  emit('expand');
}

function expandAndFocus() {
  isFocused.value = true;
  nextTick(() => textareaRef.value?.focus());
}

// Auto-resize textarea
watch(content, () => {
  nextTick(() => {
    const el = textareaRef.value;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  });
});
</script>

<template>
  <div
    class="border-t border-border px-4 py-3 transition-all"
    :class="isFocused ? 'bg-card' : 'bg-card'"
  >
    <div class="flex gap-3" :class="isFocused ? 'items-start' : 'items-center'">
      <!-- User avatar -->
      <Avatar
        :src="avatarSrc"
        :alt="avatarAlt"
        size="sm"
        class="shrink-0"
        :class="isFocused ? 'mt-0.5' : ''"
      />

      <!-- Input area -->
      <div class="min-w-0 flex-1">
        <!-- Collapsed: single-line pill input -->
        <div
          v-if="!isFocused"
          class="flex cursor-text items-center rounded-full bg-muted px-4 py-2 text-muted-foreground transition-colors"
          :class="disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/80'"
          @click="!disabled && expandAndFocus()"
        >
          <span class="flex-1 text-base">{{ placeholder }}</span>
        </div>

        <!-- Expanded: multi-line textarea -->
        <div v-show="isFocused" class="space-y-2">
          <textarea
            ref="textareaRef"
            v-model="content"
            :placeholder="placeholder"
            :disabled="disabled"
            :maxlength="maxLength + 50"
            rows="1"
            class="w-full resize-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
            style="min-height: 2.5rem; max-height: 10rem;"
            @focus="handleFocus"
            @blur="handleBlur"
            @keydown="handleKeydown"
          />

          <!-- Actions row -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <!-- Expand to full composer -->
              <button
                type="button"
                class="flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Open full composer"
                @mousedown.prevent
                @click="handleExpand"
              >
                <PhArrowsOut :size="18" />
              </button>

              <!-- Character counter (only when typing) -->
              <span
                v-if="charCount > 0"
                class="text-xs tabular-nums"
                :class="isOverLimit ? 'text-red font-semibold' : 'text-muted-foreground'"
              >
                {{ charCount }}/{{ maxLength }}
              </span>
            </div>

            <!-- Submit button -->
            <Button
              size="sm"
              :disabled="!canSubmit"
              class="rounded-full"
              @mousedown.prevent
              @click="handleSubmit"
            >
              <PhPaperPlaneRight :size="16" />
              <span>Reply</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
