import type { FeedbackReport } from '../../src/composables/useFeedbackReport';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function makeReport(overrides: Partial<FeedbackReport> = {}): FeedbackReport {
  return {
    category: 'bug',
    description: 'Timeline freezes on scroll',
    context: {
      app: { version: '0.1.0-beta', platform: 'web' },
      device: {
        userAgent: 'Mozilla/5.0',
        viewport: { width: 1920, height: 1080 },
        screen: { width: 1920, height: 1080, pixelRatio: 2 },
        online: true,
        language: 'en-US',
      },
      route: { path: '/home', params: {} },
      theme: 'dark',
      instanceUrl: 'https://mastodon.social',
      timestamp: '2026-03-31T12:00:00.000Z',
      recentErrors: [],
    },
    ...overrides,
  };
}

let useFeedbackReport: typeof import('../../src/composables/useFeedbackReport').useFeedbackReport;
let mockFetch: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  vi.resetModules();

  mockFetch = vi.fn();
  vi.stubGlobal('fetch', mockFetch);
  vi.stubGlobal('FormData', globalThis.FormData);

  vi.stubGlobal('navigator', {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });

  const mod = await import('../../src/composables/useFeedbackReport');
  useFeedbackReport = mod.useFeedbackReport;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useFeedbackReport', () => {
  describe('defaultTransport', () => {
    it('sends report to /api/feedback when server responds 200', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const { submitReport } = useFeedbackReport();
      const result = await submitReport(makeReport());

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/feedback', expect.objectContaining({
        method: 'POST',
      }));
      // Body should be FormData
      const call = mockFetch.mock.calls[0];
      expect(call[1].body).toBeInstanceOf(FormData);
    });

    it('does not call console.info when server succeeds', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      const { submitReport } = useFeedbackReport();
      await submitReport(makeReport());

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('falls back to console when server returns 501', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 501 });
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      const { submitReport } = useFeedbackReport();
      await submitReport(makeReport());

      expect(consoleSpy).toHaveBeenCalledWith('[Fediway Feedback]', expect.any(Object));
    });

    it('falls back to console when fetch throws', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      const { submitReport } = useFeedbackReport();
      await submitReport(makeReport());

      expect(consoleSpy).toHaveBeenCalledWith('[Fediway Feedback]', expect.any(Object));
    });
  });

  describe('submitReport', () => {
    it('sets isSubmitting during submission', async () => {
      let resolvePost!: () => void;
      mockFetch.mockReturnValueOnce(new Promise((resolve) => {
        resolvePost = () => resolve({ ok: true });
      }));

      const { isSubmitting, submitReport } = useFeedbackReport();
      expect(isSubmitting.value).toBe(false);

      const promise = submitReport(makeReport());
      expect(isSubmitting.value).toBe(true);

      resolvePost();
      await promise;
      expect(isSubmitting.value).toBe(false);
    });

    it('sets error when custom transport fails', async () => {
      const failingTransport = vi.fn().mockRejectedValue(new Error('Transport failed'));

      const { error, submitReport } = useFeedbackReport({ transport: failingTransport });
      const result = await submitReport(makeReport());

      expect(result).toBe(false);
      expect(error.value).toBeInstanceOf(Error);
      expect(error.value?.message).toBe('Transport failed');
    });

    it('clears error on successful submission', async () => {
      const transport = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce(undefined);

      const { error, submitReport } = useFeedbackReport({ transport });

      await submitReport(makeReport());
      expect(error.value).toBeInstanceOf(Error);

      await submitReport(makeReport());
      expect(error.value).toBeNull();
    });
  });
});
