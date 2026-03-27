import type { Status } from '@repo/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock @repo/api — provide a controllable usePosts core
const mockAddPost = vi.fn(() => ({ id: 'temp-1' }) as Status);
let capturedCallbacks: any = {};

vi.mock('@repo/api', () => ({
  usePosts: (callbacks: any) => {
    capturedCallbacks = callbacks ?? {};
    return {
      addPost: mockAddPost,
      userPosts: [],
    };
  },
  resetPostsState: vi.fn(),
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

const { usePosts } = await import('../usePosts');

beforeEach(() => {
  mockToastSuccess.mockClear();
  mockToastError.mockClear();
  capturedCallbacks = {};
});

describe('usePosts (web wrapper — toast feedback)', () => {
  it('provides onPublished callback that toasts "Post published"', () => {
    usePosts();
    capturedCallbacks.onPublished({ id: 'real-1' } as Status);
    expect(mockToastSuccess).toHaveBeenCalledWith('Post published');
  });

  it('provides onError callback that toasts error', () => {
    usePosts();
    capturedCallbacks.onError(new Error('Network error'));
    expect(mockToastError).toHaveBeenCalledWith('Failed to post', 'Please try again.');
  });

  it('provides onAuthError callback that toasts "Not signed in"', () => {
    usePosts();
    capturedCallbacks.onAuthError();
    expect(mockToastError).toHaveBeenCalledWith('Not signed in');
  });

  it('passes through addPost and userPosts from core', () => {
    const result = usePosts();
    expect(result.addPost).toBe(mockAddPost);
    expect(result.userPosts).toEqual([]);
  });
});
