import type { ReportError } from '../../src/composables/useReport';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockClient } from '../../src/mock/client';
import { withSetup } from '../utils/withSetup';

let mockClient: ReturnType<typeof createMockClient>;

vi.mock('../../src/composables/useClient', () => ({
  useClient: () => mockClient,
}));

const { useReport } = await import('../../src/composables/useReport');

beforeEach(() => {
  mockClient = createMockClient();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useReport', () => {
  describe('fetchInstanceRules', () => {
    it('returns non-empty rules with id and text', async () => {
      const [report] = withSetup(() => useReport());
      await report.fetchInstanceRules();
      expect(report.instanceRules.value.length).toBeGreaterThan(0);
      expect(report.instanceRules.value[0]).toHaveProperty('id');
      expect(report.instanceRules.value[0]).toHaveProperty('text');
    });

    it('error fires onError with action: fetchRules', async () => {
      const origInstance = mockClient.rest.v2.instance;
      (mockClient.rest.v2 as Record<string, unknown>).instance = {
        fetch: async () => { throw new Error('Instance down'); },
      };

      const errors: ReportError[] = [];
      const [report] = withSetup(() => useReport({ onError: e => errors.push(e) }));
      await report.fetchInstanceRules();

      expect(errors).toHaveLength(1);
      expect(errors[0]!.action).toBe('fetchRules');
      expect(errors[0]!.error.message).toBe('Instance down');

      (mockClient.rest.v2 as Record<string, unknown>).instance = origInstance;
    });
  });

  describe('submitReport', () => {
    it('with category spam returns report', async () => {
      const [report] = withSetup(() => useReport());
      const result = await report.submitReport({
        accountId: '1',
        category: 'spam',
      });
      expect(result).toBeDefined();
      expect(result!.category).toBe('spam');
    });

    it('with all params returns them', async () => {
      const [report] = withSetup(() => useReport());
      const result = await report.submitReport({
        accountId: '1',
        statusIds: ['s1', 's2'],
        comment: 'This is spam content',
        forward: true,
        category: 'violation',
        ruleIds: ['1', '2'],
      });
      expect(result).toBeDefined();
      expect(result!.category).toBe('violation');
      expect(result!.comment).toBe('This is spam content');
      expect(result!.statusIds).toEqual(['s1', 's2']);
      expect(result!.ruleIds).toEqual(['1', '2']);
    });

    it('error fires onError with action: submitReport', async () => {
      const origReports = mockClient.rest.v1.reports;
      (mockClient.rest.v1 as Record<string, unknown>).reports = {
        create: async () => { throw new Error('Server error'); },
      };

      const errors: ReportError[] = [];
      const [report] = withSetup(() => useReport({ onError: e => errors.push(e) }));
      const result = await report.submitReport({ accountId: '1' });

      expect(result).toBeUndefined();
      expect(errors).toHaveLength(1);
      expect(errors[0]!.action).toBe('submitReport');

      (mockClient.rest.v1 as Record<string, unknown>).reports = origReports;
    });
  });

  describe('submitReport with non-existent account', () => {
    it('fires onError when target account does not exist', async () => {
      const errors: ReportError[] = [];
      const [report] = withSetup(() => useReport({ onError: e => errors.push(e) }));
      const result = await report.submitReport({ accountId: 'nonexistent-999', category: 'spam' });

      expect(result).toBeUndefined();
      expect(errors).toHaveLength(1);
      expect(errors[0]!.action).toBe('submitReport');
      expect(report.error.value).toBeTruthy();
    });
  });

  describe('isSubmitting', () => {
    it('true during submission, false after', async () => {
      const [report] = withSetup(() => useReport());
      expect(report.isSubmitting.value).toBe(false);
      const promise = report.submitReport({ accountId: '1', category: 'spam' });
      expect(report.isSubmitting.value).toBe(true);
      await promise;
      expect(report.isSubmitting.value).toBe(false);
    });
  });

  describe('error clearing', () => {
    it('error cleared between operations', async () => {
      const origReports = mockClient.rest.v1.reports;
      (mockClient.rest.v1 as Record<string, unknown>).reports = {
        create: async () => { throw new Error('fail'); },
      };

      const [report] = withSetup(() => useReport());
      await report.submitReport({ accountId: '1' });
      expect(report.error.value).toBeTruthy();

      // Restore and do a successful operation
      (mockClient.rest.v1 as Record<string, unknown>).reports = origReports;
      await report.submitReport({ accountId: '1', category: 'spam' });
      expect(report.error.value).toBeNull();
    });
  });
});
