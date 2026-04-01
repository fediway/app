<script setup lang="ts">
import { PhArrowLeft, PhCamera, PhCaretRight, PhChatCircle, PhLightbulb, PhPaperPlaneTilt, PhWarningCircle, PhX } from '@phosphor-icons/vue';
import { ref, watch } from 'vue';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { SegmentedControl } from '../ui/segmented-control';
import { Textarea } from '../ui/textarea';

type FeedbackCategory = 'bug' | 'suggestion' | 'other';

interface Props {
  isOpen: boolean;
  /** Pre-select a category (e.g. from post-error toast) */
  initialCategory?: FeedbackCategory | null;
  /** Pre-populated error context (from error toast action) */
  errorContext?: { message: string; timestamp: number } | null;
}

const props = withDefaults(defineProps<Props>(), {
  initialCategory: null,
  errorContext: null,
});

const emit = defineEmits<{
  close: [];
  submit: [data: {
    category: FeedbackCategory;
    description: string;
    expectedBehavior?: string;
    frequency?: string;
    screenshot: File | null;
  }];
}>();

const category = ref<FeedbackCategory | null>(null);
const description = ref('');
const expectedBehavior = ref('');
const frequency = ref('');
const screenshot = ref<File | null>(null);
const screenshotPreview = ref<string | null>(null);
const showPrivacy = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const isSubmitting = ref(false);

const DESCRIPTION_LIMIT = 2000;

const frequencyOptions = [
  { value: 'always', label: 'Always' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'once', label: 'Once' },
];

const categoryTitle: Record<FeedbackCategory, string> = {
  bug: 'I hit a problem',
  suggestion: 'I\'d love to see...',
  other: 'I have something to share',
};

function resetForm() {
  category.value = null;
  description.value = '';
  expectedBehavior.value = '';
  frequency.value = '';
  screenshot.value = null;
  screenshotPreview.value = null;
  showPrivacy.value = false;
  isSubmitting.value = false;
}

watch(() => props.isOpen, (open) => {
  if (!open)
    resetForm();
  if (open && props.initialCategory) {
    category.value = props.initialCategory;
  }
  if (open && props.errorContext) {
    category.value = 'bug';
    description.value = `Error: ${props.errorContext.message}`;
  }
});

function handleOpenChange(open: boolean) {
  if (!open)
    emit('close');
}

function selectCategory(cat: FeedbackCategory) {
  category.value = cat;
}

function goBack() {
  category.value = null;
  description.value = '';
  expectedBehavior.value = '';
  frequency.value = '';
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file)
    return;

  if (!file.type.startsWith('image/')) {
    screenshot.value = null;
    screenshotPreview.value = null;
    return;
  }

  screenshot.value = file;
  const reader = new FileReader();
  reader.onload = () => {
    screenshotPreview.value = reader.result as string;
  };
  reader.readAsDataURL(file);
}

function clearScreenshot() {
  screenshot.value = null;
  screenshotPreview.value = null;
  if (fileInput.value)
    fileInput.value.value = '';
}

function handleSubmit() {
  if (!category.value || !description.value.trim() || isSubmitting.value)
    return;

  isSubmitting.value = true;
  emit('submit', {
    category: category.value,
    description: description.value.trim(),
    expectedBehavior: expectedBehavior.value.trim() || undefined,
    frequency: frequency.value || undefined,
    screenshot: screenshot.value,
  });
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent size="md" full-screen-mobile show-close>
      <!-- Step 1: Category selection -->
      <template v-if="!category">
        <DialogHeader class="px-6 pt-6 pb-2">
          <DialogTitle>Share your thoughts</DialogTitle>
          <DialogDescription>We read every response — your feedback directly shapes what we build next.</DialogDescription>
        </DialogHeader>

        <div class="flex flex-col gap-2.5 px-6 pb-6 pt-3">
          <button
            class="flex items-center gap-3.5 rounded-xl border border-border px-4 py-3.5 text-left transition-colors hover:bg-muted"
            @click="selectCategory('bug')"
          >
            <PhWarningCircle :size="22" class="shrink-0 text-red" />
            <div>
              <div class="text-sm font-medium text-foreground">
                I hit a problem
              </div>
              <div class="text-xs text-muted-foreground">
                A bug, crash, or something that looks off
              </div>
            </div>
          </button>

          <button
            class="flex items-center gap-3.5 rounded-xl border border-border px-4 py-3.5 text-left transition-colors hover:bg-muted"
            @click="selectCategory('suggestion')"
          >
            <PhLightbulb :size="22" class="shrink-0 text-yellow" />
            <div>
              <div class="text-sm font-medium text-foreground">
                I'd love to see...
              </div>
              <div class="text-xs text-muted-foreground">
                A feature or improvement you're missing
              </div>
            </div>
          </button>

          <button
            class="flex items-center gap-3.5 rounded-xl border border-border px-4 py-3.5 text-left transition-colors hover:bg-muted"
            @click="selectCategory('other')"
          >
            <PhChatCircle :size="22" class="shrink-0 text-galaxy-500" />
            <div>
              <div class="text-sm font-medium text-foreground">
                I have something to share
              </div>
              <div class="text-xs text-muted-foreground">
                A question, compliment, or anything else
              </div>
            </div>
          </button>
        </div>
      </template>

      <!-- Step 2: Form (adapts based on category) -->
      <template v-else>
        <DialogHeader class="px-6 pt-6 pb-4">
          <div class="flex items-center gap-2">
            <button
              class="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              @click="goBack"
            >
              <PhArrowLeft :size="18" />
              <span class="sr-only">Back</span>
            </button>
            <div>
              <DialogTitle>{{ categoryTitle[category] }}</DialogTitle>
              <DialogDescription class="sr-only">
                Feedback form
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form class="flex flex-col gap-4 px-6 pb-6 pt-4" @submit.prevent="handleSubmit">
          <!-- Main description -->
          <div>
            <label class="mb-2 block text-sm font-medium text-foreground">
              {{ category === 'bug' ? 'What happened?' : 'What\'s on your mind?' }}
            </label>
            <Textarea
              v-model="description"
              :placeholder="category === 'bug' ? 'Describe what you ran into...' : 'Tell us what you think...'"
              :maxlength="DESCRIPTION_LIMIT"
              rows="3"
              class="resize-none"
            />
            <div class="mt-1 text-right text-xs text-muted-foreground" :class="{ 'text-red': description.length > DESCRIPTION_LIMIT }">
              {{ description.length }} / {{ DESCRIPTION_LIMIT }}
            </div>
          </div>

          <!-- Bug-specific fields (not hidden — part of the natural flow) -->
          <template v-if="category === 'bug'">
            <div>
              <label class="mb-2 block text-sm font-medium text-foreground">
                What should have happened?
              </label>
              <Textarea
                v-model="expectedBehavior"
                placeholder="Optional — describe what you expected instead"
                rows="2"
                class="resize-none"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-foreground">
                How often does this happen?
              </label>
              <SegmentedControl
                :model-value="frequency"
                :options="frequencyOptions"
                @update:model-value="frequency = $event"
              />
            </div>
          </template>

          <!-- Screenshot (all categories) -->
          <div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileChange"
            >
            <div v-if="screenshotPreview" class="flex items-start gap-2">
              <img :src="screenshotPreview" alt="Screenshot" class="h-20 rounded-lg object-cover">
              <button
                type="button"
                class="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                @click="clearScreenshot"
              >
                <PhX :size="16" />
                <span class="sr-only">Remove screenshot</span>
              </button>
            </div>
            <button
              v-else
              type="button"
              class="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              @click="fileInput?.click()"
            >
              <PhCamera :size="18" />
              Add screenshot
            </button>
          </div>

          <!-- Privacy disclosure -->
          <div class="space-y-2">
            <button
              type="button"
              class="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              @click="showPrivacy = !showPrivacy"
            >
              <PhCaretRight
                :size="12"
                class="transition-transform"
                :class="{ 'rotate-90': showPrivacy }"
              />
              We include device info to help us fix this
            </button>

            <div v-if="showPrivacy" class="rounded-xl bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
              Your account handle (if signed in), app version, platform,
              screen size, dark/light mode, current page, connection status,
              instance URL, and recent error messages. No tokens, passwords,
              or post content is ever included.
            </div>
          </div>

          <!-- Submit -->
          <Button type="submit" class="w-full" :disabled="!description.trim() || isSubmitting">
            <PhPaperPlaneTilt :size="18" />
            {{ isSubmitting ? 'Sending...' : category === 'bug' ? 'Send Report' : 'Send Feedback' }}
          </Button>
        </form>
      </template>
    </DialogContent>
  </Dialog>
</template>
