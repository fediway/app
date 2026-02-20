import type { FilterError } from '../../src/composables/useFilters';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockClient } from '../../src/mock/client';
import { withSetup } from '../utils/withSetup';

let mockClient: ReturnType<typeof createMockClient>;

vi.mock('../../src/composables/useClient', () => ({
  useClient: () => mockClient,
}));

const { useFilters } = await import('../../src/composables/useFilters');

beforeEach(() => {
  mockClient = createMockClient();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useFilters', () => {
  describe('fetchFilters', () => {
    it('returns empty initially', async () => {
      const [fil] = withSetup(() => useFilters());
      await fil.fetchFilters();
      expect(fil.filters.value).toEqual([]);
    });
  });

  describe('createFilter', () => {
    it('returns filter with correct fields, updates filters ref', async () => {
      const [fil] = withSetup(() => useFilters());
      const result = await fil.createFilter({
        title: 'Bad words',
        context: ['home', 'public'],
        keywordsAttributes: [{ keyword: 'spam', wholeWord: true }],
      });

      expect(result).toBeDefined();
      expect(result!.title).toBe('Bad words');
      expect(result!.context).toEqual(['home', 'public']);
      expect(result!.keywords).toHaveLength(1);
      expect(result!.keywords[0]!.keyword).toBe('spam');
      expect(result!.keywords[0]!.wholeWord).toBe(true);
      expect(fil.filters.value).toHaveLength(1);
    });

    it('error fires onError with action: create', async () => {
      const origFilters = mockClient.rest.v2.filters;
      (mockClient.rest.v2 as Record<string, unknown>).filters = {
        ...origFilters,
        create: async () => { throw new Error('Create failed'); },
      };

      const errors: FilterError[] = [];
      const [fil] = withSetup(() => useFilters({ onError: e => errors.push(e) }));
      const result = await fil.createFilter({ title: 'Test', context: ['home'] });

      expect(result).toBeUndefined();
      expect(errors).toHaveLength(1);
      expect(errors[0]!.action).toBe('create');

      (mockClient.rest.v2 as Record<string, unknown>).filters = origFilters;
    });
  });

  describe('fetchFilter', () => {
    it('returns single filter by id', async () => {
      const [fil] = withSetup(() => useFilters());
      const created = await fil.createFilter({ title: 'My Filter', context: ['home'] });
      const fetched = await fil.fetchFilter(created!.id);
      expect(fetched).toBeDefined();
      expect(fetched!.title).toBe('My Filter');
      expect(fetched!.id).toBe(created!.id);
    });
  });

  describe('updateFilter', () => {
    it('changes title, reflected in filters ref', async () => {
      const [fil] = withSetup(() => useFilters());
      const created = await fil.createFilter({ title: 'Old Title', context: ['home'] });
      const updated = await fil.updateFilter(created!.id, { title: 'New Title' });

      expect(updated).toBeDefined();
      expect(updated!.title).toBe('New Title');
      expect(fil.filters.value.find(f => f.id === created!.id)!.title).toBe('New Title');
    });

    it('adds keyword', async () => {
      const [fil] = withSetup(() => useFilters());
      const created = await fil.createFilter({
        title: 'Filter',
        context: ['home'],
        keywordsAttributes: [{ keyword: 'first' }],
      });
      const updated = await fil.updateFilter(created!.id, {
        keywordsAttributes: [{ keyword: 'second', wholeWord: true }],
      });

      expect(updated!.keywords).toHaveLength(2);
      expect(updated!.keywords.find(k => k.keyword === 'second')).toBeDefined();
    });

    it('removes keyword via _destroy', async () => {
      const [fil] = withSetup(() => useFilters());
      const created = await fil.createFilter({
        title: 'Filter',
        context: ['home'],
        keywordsAttributes: [{ keyword: 'removeme' }, { keyword: 'keepme' }],
      });
      const keywordToRemove = created!.keywords.find(k => k.keyword === 'removeme');
      const updated = await fil.updateFilter(created!.id, {
        keywordsAttributes: [{ id: keywordToRemove!.id, _destroy: true }],
      });

      expect(updated!.keywords).toHaveLength(1);
      expect(updated!.keywords[0]!.keyword).toBe('keepme');
    });
  });

  describe('removeFilter', () => {
    it('removes from filters ref', async () => {
      const [fil] = withSetup(() => useFilters());
      const created = await fil.createFilter({ title: 'To Remove', context: ['home'] });
      expect(fil.filters.value).toHaveLength(1);

      await fil.removeFilter(created!.id);
      expect(fil.filters.value).toHaveLength(0);
    });

    it('non-existent filter does not throw', async () => {
      const [fil] = withSetup(() => useFilters());
      await fil.createFilter({ title: 'Keep Me', context: ['home'] });
      await fil.removeFilter('does-not-exist');
      // Original filter should still be there
      expect(fil.filters.value).toHaveLength(1);
    });
  });

  describe('isLoading', () => {
    it('true during fetchFilters, false after', async () => {
      const [fil] = withSetup(() => useFilters());
      expect(fil.isLoading.value).toBe(false);
      const promise = fil.fetchFilters();
      expect(fil.isLoading.value).toBe(true);
      await promise;
      expect(fil.isLoading.value).toBe(false);
    });
  });

  describe('fetchFilters returns all after multiple creates', () => {
    it('multiple filters are all present', async () => {
      const [fil] = withSetup(() => useFilters());
      await fil.createFilter({ title: 'Filter A', context: ['home'] });
      await fil.createFilter({ title: 'Filter B', context: ['public'] });
      await fil.createFilter({ title: 'Filter C', context: ['home', 'public'] });

      await fil.fetchFilters();
      expect(fil.filters.value).toHaveLength(3);
      const titles = fil.filters.value.map(f => f.title);
      expect(titles).toContain('Filter A');
      expect(titles).toContain('Filter B');
      expect(titles).toContain('Filter C');
    });
  });

  describe('full CRUD round-trip', () => {
    it('create, read, update, delete lifecycle', async () => {
      const [fil] = withSetup(() => useFilters());

      // Create
      const created = await fil.createFilter({
        title: 'Lifecycle Test',
        context: ['home', 'public'],
        filterAction: 'hide',
        keywordsAttributes: [{ keyword: 'test', wholeWord: true }],
      });
      expect(created).toBeDefined();
      expect(fil.filters.value).toHaveLength(1);

      // Read
      const fetched = await fil.fetchFilter(created!.id);
      expect(fetched!.title).toBe('Lifecycle Test');

      // Update
      const updated = await fil.updateFilter(created!.id, { title: 'Updated Title' });
      expect(updated!.title).toBe('Updated Title');
      expect(fil.filters.value[0]!.title).toBe('Updated Title');

      // Delete
      await fil.removeFilter(created!.id);
      expect(fil.filters.value).toHaveLength(0);
    });
  });

  describe('filter with expiresIn', () => {
    it('sets expiresAt', async () => {
      const [fil] = withSetup(() => useFilters());
      const created = await fil.createFilter({
        title: 'Expiring',
        context: ['home'],
        expiresIn: 3600,
      });
      expect(created!.expiresAt).toBeTruthy();
      // Verify it's a valid date in the future
      const expiresDate = new Date(created!.expiresAt!);
      expect(expiresDate.getTime()).toBeGreaterThan(Date.now() - 1000);
    });
  });
});
