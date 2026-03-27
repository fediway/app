import type { Status } from '@repo/types';
import { makeStatus } from '@repo/config/vitest/helpers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

// Mock store — module-level so tests can manipulate it
const mockStore = new Map<string, Partial<Status>>();

vi.mock('@repo/api', () => {
  const toggleFavourite = vi.fn();
  const toggleReblog = vi.fn();
  const toggleBookmark = vi.fn();
  const deleteStatus = vi.fn();

  return {
    useStatusStore: () => ({
      get: (id: string) => mockStore.get(id),
    }),
    useStatusActions: () => ({
      toggleFavourite,
      toggleReblog,
      toggleBookmark,
      deleteStatus,
    }),
    useAuth: () => ({
      isAuthenticated: ref(true),
    }),
  };
});

const mockToastSuccess = vi.fn(() => 'toast-id-1');
const mockToastError = vi.fn();
const mockRemoveToast = vi.fn();

vi.mock('@repo/ui', () => ({
  useToast: () => ({
    toast: Object.assign(vi.fn(), {
      success: mockToastSuccess,
      error: mockToastError,
    }),
    removeToast: mockRemoveToast,
  }),
}));

// Must import after mocks are set up
const { useWebActions } = await import('../useWebActions');

beforeEach(() => {
  mockStore.clear();
  mockToastSuccess.mockClear();
  mockToastError.mockClear();
  mockRemoveToast.mockClear();
});

afterEach(() => {
  mockStore.clear();
});

describe('useWebActions', () => {
  describe('withStoreState', () => {
    it('passes through statuses not in store', () => {
      const { withStoreState } = useWebActions();
      const statuses = [makeStatus('1'), makeStatus('2')];
      const source = ref(statuses);
      const result = withStoreState(source);

      expect(result.value).toHaveLength(2);
      expect(result.value[0]!.id).toBe('1');
      expect(result.value[1]!.id).toBe('2');
    });

    it('merges store state into matching statuses', () => {
      mockStore.set('1', { id: '1', favourited: true, favouritesCount: 5 } as Partial<Status>);

      const { withStoreState } = useWebActions();
      const source = ref([makeStatus('1', { favourited: false, favouritesCount: 0 })]);
      const result = withStoreState(source);

      expect(result.value[0]!.favourited).toBe(true);
      expect(result.value[0]!.favouritesCount).toBe(5);
    });

    it('merges store state into reblog inner status', () => {
      const inner = makeStatus('inner-1', { favourited: false });
      const reblog = makeStatus('outer-1', { reblog: inner });
      mockStore.set('inner-1', { id: 'inner-1', favourited: true } as Partial<Status>);

      const { withStoreState } = useWebActions();
      const source = ref([reblog]);
      const result = withStoreState(source);

      expect(result.value[0]!.reblog!.favourited).toBe(true);
      // Outer status is unchanged
      expect(result.value[0]!.id).toBe('outer-1');
    });

    it('uses reblog id for store lookup, not outer id', () => {
      const inner = makeStatus('reblog-target', { bookmarked: false });
      const outer = makeStatus('outer-wrap', { reblog: inner });
      mockStore.set('reblog-target', { id: 'reblog-target', bookmarked: true } as Partial<Status>);

      const { withStoreState } = useWebActions();
      const source = ref([outer]);
      const result = withStoreState(source);

      expect(result.value[0]!.reblog!.bookmarked).toBe(true);
    });
  });

  describe('getStoreStatus', () => {
    it('returns undefined for undefined input', () => {
      const { getStoreStatus } = useWebActions();
      expect(getStoreStatus(undefined)).toBeUndefined();
    });

    it('returns raw status when not in store', () => {
      const { getStoreStatus } = useWebActions();
      const status = makeStatus('1');
      expect(getStoreStatus(status)).toBe(status);
    });

    it('merges store state into raw status', () => {
      mockStore.set('1', { id: '1', favourited: true, favouritesCount: 5 } as Partial<Status>);

      const { getStoreStatus } = useWebActions();
      const raw = makeStatus('1', { favourited: false, favouritesCount: 0 });
      const result = getStoreStatus(raw);

      // Store flags override raw
      expect(result!.favourited).toBe(true);
      expect(result!.favouritesCount).toBe(5);
      // Raw fields are preserved (not lost)
      expect(result!.mediaAttachments).toEqual(raw.mediaAttachments);
      expect(result!.content).toBe(raw.content);
      expect(result!.account).toEqual(raw.account);
    });
  });

  describe('handleBookmark', () => {
    it('shows "Saved" toast when bookmarking', () => {
      const status = makeStatus('1', { bookmarked: false });
      mockStore.set('1', status as Partial<Status>);

      const { handleBookmark } = useWebActions();
      handleBookmark('1');

      expect(mockToastSuccess).toHaveBeenCalledWith('Saved');
    });

    it('shows "Removed from bookmarks" toast when unbookmarking', () => {
      const status = makeStatus('1', { bookmarked: true });
      mockStore.set('1', status as Partial<Status>);

      const { handleBookmark } = useWebActions();
      handleBookmark('1');

      expect(mockToastSuccess).toHaveBeenCalledWith('Removed from bookmarks');
    });
  });
});
