import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock @repo/api — provide a controllable useFollows core
const mockToggleFollow = vi.fn();
const mockIsFollowing = vi.fn(() => false);
const mockHasRelationship = vi.fn(() => false);
const mockGetRelationship = vi.fn();
const mockFetchRelationships = vi.fn();
let capturedCallbacks: any = {};

vi.mock('@repo/api', () => ({
  useFollows: (callbacks: any) => {
    capturedCallbacks = callbacks ?? {};
    return {
      toggleFollow: mockToggleFollow,
      isFollowing: mockIsFollowing,
      hasRelationship: mockHasRelationship,
      getRelationship: mockGetRelationship,
      fetchRelationships: mockFetchRelationships,
      followState: new Map(),
    };
  },
  _resetFollowsState: vi.fn(),
}));

// Mock @repo/ui — capture toast calls
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('@repo/ui', () => ({
  useToast: () => ({
    toast: Object.assign(vi.fn(), {
      success: mockToastSuccess,
      error: mockToastError,
    }),
    removeToast: vi.fn(),
  }),
}));

const { useFollows } = await import('../useFollows');

beforeEach(() => {
  mockToastSuccess.mockClear();
  mockToastError.mockClear();
  capturedCallbacks = {};
});

describe('useFollows (web wrapper — toast feedback)', () => {
  it('provides onToggle callback that toasts "Followed"', () => {
    useFollows();
    capturedCallbacks.onToggle('1', true);
    expect(mockToastSuccess).toHaveBeenCalledWith('Followed');
  });

  it('provides onToggle callback that toasts "Unfollowed"', () => {
    useFollows();
    capturedCallbacks.onToggle('1', false);
    expect(mockToastSuccess).toHaveBeenCalledWith('Unfollowed');
  });

  it('provides onError callback that toasts error', () => {
    useFollows();
    capturedCallbacks.onError('1', new Error('Network error'));
    expect(mockToastError).toHaveBeenCalled();
  });

  it('passes through all methods from core', () => {
    const result = useFollows();
    expect(result.toggleFollow).toBe(mockToggleFollow);
    expect(result.isFollowing).toBe(mockIsFollowing);
    expect(result.hasRelationship).toBe(mockHasRelationship);
    expect(result.fetchRelationships).toBe(mockFetchRelationships);
  });
});
