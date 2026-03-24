import type { Status } from '@repo/types';
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

function makeStatus(id: string, overrides: Partial<Status> = {}): Status {
  return {
    id,
    uri: `https://example.com/statuses/${id}`,
    createdAt: '2024-01-01T00:00:00Z',
    editedAt: null,
    account: { id: 'acct-1', acct: 'user@example.com', displayName: 'User', avatar: '' } as Status['account'],
    content: '<p>Test post</p>',
    visibility: 'public',
    sensitive: false,
    spoilerText: '',
    mediaAttachments: [],
    mentions: [],
    tags: [],
    emojis: [],
    reblogsCount: 0,
    favouritesCount: 0,
    repliesCount: 0,
    reblog: null,
    poll: null,
    card: null,
    language: 'en',
    text: null,
    favourited: false,
    reblogged: false,
    muted: false,
    bookmarked: false,
    pinned: false,
    ...overrides,
  } as unknown as Status;
}

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

    it('returns store version when available', () => {
      const storeStatus = { id: '1', favourited: true } as Partial<Status>;
      mockStore.set('1', storeStatus);

      const { getStoreStatus } = useWebActions();
      const raw = makeStatus('1', { favourited: false });
      const result = getStoreStatus(raw);

      expect(result).toBe(storeStatus);
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
