import type { mastodon } from 'masto';
import { ref, shallowRef } from 'vue';
import { useClient } from './useClient';

export type ReportCategory = 'spam' | 'violation' | 'legal' | 'other';

export interface SubmitReportParams {
  accountId: string;
  statusIds?: string[];
  comment?: string;
  /** Forward report to the remote instance (for federated accounts) */
  forward?: boolean;
  category?: ReportCategory;
  /** Instance rule IDs — only relevant when category is 'violation' */
  ruleIds?: string[];
}

export interface ReportError {
  action: 'fetchRules' | 'submitReport';
  error: Error;
}

export interface UseReportOptions {
  onError?: (e: ReportError) => void;
}

export interface UseReportReturn {
  isSubmitting: ReturnType<typeof ref<boolean>>;
  error: ReturnType<typeof ref<Error | null>>;
  instanceRules: ReturnType<typeof shallowRef<mastodon.v1.Rule[]>>;
  fetchInstanceRules: () => Promise<void>;
  submitReport: (params: SubmitReportParams) => Promise<mastodon.v1.Report | undefined>;
}

export function useReport(options?: UseReportOptions): UseReportReturn {
  const client = useClient();

  // Named isSubmitting (not isLoading) — this drives user-facing submit button state
  const isSubmitting = ref(false);
  const error = ref<Error | null>(null);
  const instanceRules = shallowRef<mastodon.v1.Rule[]>([]);

  async function fetchInstanceRules(): Promise<void> {
    try {
      isSubmitting.value = true;
      error.value = null;
      const instance = await client.rest.v2.instance.fetch();
      instanceRules.value = (instance.rules ?? []) as mastodon.v1.Rule[];
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to fetch instance rules');
      error.value = e;
      options?.onError?.({ action: 'fetchRules', error: e });
    }
    finally {
      isSubmitting.value = false;
    }
  }

  async function submitReport(params: SubmitReportParams): Promise<mastodon.v1.Report | undefined> {
    try {
      isSubmitting.value = true;
      error.value = null;
      const result = await client.rest.v1.reports.create({
        accountId: params.accountId,
        statusIds: params.statusIds,
        comment: params.comment,
        forward: params.forward,
        category: params.category,
        ruleIds: params.ruleIds,
      });
      return result as mastodon.v1.Report;
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to submit report');
      error.value = e;
      options?.onError?.({ action: 'submitReport', error: e });
      return undefined;
    }
    finally {
      isSubmitting.value = false;
    }
  }

  return {
    isSubmitting,
    error,
    instanceRules,
    fetchInstanceRules,
    submitReport,
  };
}
