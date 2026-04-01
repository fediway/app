import type { FeedbackContext } from './useFeedbackContext';
import { ref } from 'vue';

export type FeedbackCategory = 'bug' | 'suggestion' | 'other';

export interface FeedbackReport {
  category: FeedbackCategory;
  description: string;
  expectedBehavior?: string;
  frequency?: 'always' | 'sometimes' | 'once';
  screenshot?: File | null;
  context: FeedbackContext;
}

export interface UseFeedbackReportOptions {
  transport?: (report: FeedbackReport) => Promise<void>;
}

export interface UseFeedbackReportReturn {
  isSubmitting: ReturnType<typeof ref<boolean>>;
  error: ReturnType<typeof ref<Error | null>>;
  submitReport: (report: FeedbackReport) => Promise<boolean>;
}

async function defaultTransport(report: FeedbackReport): Promise<void> {
  // Try server endpoint first
  try {
    const formData = new FormData();
    // Send report data as JSON in a field
    const { screenshot, ...data } = report;
    formData.append('data', JSON.stringify(data));
    if (screenshot)
      formData.append('screenshot', screenshot);

    const res = await fetch('/api/feedback', {
      method: 'POST',
      body: formData,
    });
    if (res.ok)
      return;
  }
  catch {
    // Server unavailable (dev without Nitro, network error) — fall through
  }

  // Fallback: console + clipboard
  // eslint-disable-next-line no-console
  console.info('[Fediway Feedback]', report);
  try {
    const { screenshot: _s, ...data } = report;
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  }
  catch {
    // Clipboard may not be available (insecure context, denied permission)
  }
}

export function useFeedbackReport(options?: UseFeedbackReportOptions): UseFeedbackReportReturn {
  const isSubmitting = ref(false);
  const error = ref<Error | null>(null);
  const transport = options?.transport ?? defaultTransport;

  async function submitReport(report: FeedbackReport): Promise<boolean> {
    try {
      isSubmitting.value = true;
      error.value = null;
      await transport(report);
      return true;
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to submit feedback');
      return false;
    }
    finally {
      isSubmitting.value = false;
    }
  }

  return { isSubmitting, error, submitReport };
}
