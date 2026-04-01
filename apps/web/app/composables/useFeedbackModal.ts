import { ref } from 'vue';

export type FeedbackInitialCategory = 'bug' | 'suggestion' | 'other';

const isOpen = ref(false);
const initialCategory = ref<FeedbackInitialCategory | null>(null);
const errorContext = ref<{ message: string; timestamp: number } | null>(null);

export function useFeedbackModal() {
  function open(category?: FeedbackInitialCategory, error?: { message: string; timestamp: number }) {
    initialCategory.value = category ?? null;
    errorContext.value = error ?? null;
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
    initialCategory.value = null;
    errorContext.value = null;
  }

  return { isOpen, initialCategory, errorContext, open, close };
}
