<script setup lang="ts">
import { PhCamera, PhPaperPlaneTilt, PhX } from '@phosphor-icons/vue';
import { computed, ref, watch } from 'vue';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';

type FeedbackCategory = 'bug' | 'suggestion' | 'other';

interface Props {
  isOpen: boolean;
  initialCategory?: FeedbackCategory | null;
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

const category = ref<FeedbackCategory>('other');
const description = ref('');
const screenshot = ref<File | null>(null);
const screenshotPreview = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const isSubmitting = ref(false);

const DESCRIPTION_LIMIT = 2000;

const categories: { value: FeedbackCategory; label: string }[] = [
  { value: 'bug', label: 'Bug' },
  { value: 'suggestion', label: 'Idea' },
  { value: 'other', label: 'Other' },
];

const canSubmit = computed(() =>
  description.value.trim().length > 0
  && description.value.length <= DESCRIPTION_LIMIT
  && !isSubmitting.value,
);

function resetForm() {
  category.value = 'other';
  description.value = '';
  screenshot.value = null;
  screenshotPreview.value = null;
  isSubmitting.value = false;
}

watch(() => props.isOpen, (open) => {
  if (!open)
    resetForm();
  if (open && props.initialCategory)
    category.value = props.initialCategory;
  if (open && props.errorContext) {
    category.value = 'bug';
    description.value = `Error: ${props.errorContext.message}`;
  }
});

function handleOpenChange(open: boolean) {
  if (!open)
    emit('close');
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !file.type.startsWith('image/'))
    return;

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
  if (!canSubmit.value)
    return;
  isSubmitting.value = true;
  emit('submit', {
    category: category.value,
    description: description.value.trim(),
    screenshot: screenshot.value,
  });
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent size="md" full-screen-mobile show-close>
      <DialogHeader class="px-6 pt-6 pb-4">
        <DialogTitle>Early Access Feedback</DialogTitle>
        <DialogDescription class="text-sm text-muted-foreground">
          You're shaping what comes next.
        </DialogDescription>
      </DialogHeader>

      <form class="flex flex-col gap-5 px-6 pb-6" @submit.prevent="handleSubmit">
        <!-- Category pills -->
        <div class="flex gap-2 mt-4">
          <button
            v-for="cat in categories"
            :key="cat.value"
            type="button"
            class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer"
            :class="category === cat.value
              ? 'bg-foreground text-background'
              : 'bg-muted text-muted-foreground hover:text-foreground'"
            @click="category = cat.value"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- Description -->
        <Textarea
          v-model="description"
          placeholder="What's on your mind?"
          :maxlength="DESCRIPTION_LIMIT + 50"
          rows="4"
          class="resize-none"
        />

        <!-- Screenshot -->
        <div class="flex items-center gap-3">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
          >

          <div v-if="screenshotPreview" class="flex items-center gap-2">
            <img :src="screenshotPreview" alt="Screenshot" class="h-12 rounded-lg object-cover">
            <button
              type="button"
              class="rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
              @click="clearScreenshot"
            >
              <PhX :size="14" />
              <span class="sr-only">Remove</span>
            </button>
          </div>

          <button
            v-else
            type="button"
            class="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            @click="fileInput?.click()"
          >
            <PhCamera :size="16" />
            Screenshot
          </button>

          <div class="ml-auto">
            <Button type="submit" size="sm" :disabled="!canSubmit">
              <PhPaperPlaneTilt :size="16" />
              {{ isSubmitting ? 'Sending...' : 'Send' }}
            </Button>
          </div>
        </div>

        <p class="text-xs text-muted-foreground">
          Includes device info to help us diagnose issues.
        </p>
      </form>
    </DialogContent>
  </Dialog>
</template>
