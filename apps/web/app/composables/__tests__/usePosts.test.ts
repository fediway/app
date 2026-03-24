import type { Status } from '@repo/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { _resetPostsState, usePosts } from '../usePosts';

// Mock @repo/api
const mockCreate = vi.fn();
vi.mock('@repo/api', () => ({
  useAuth: () => ({
    currentUser: {
      value: {
        id: 'user-1',
        acct: 'testuser@example.com',
        displayName: 'Test User',
        avatar: 'https://example.com/avatar.png',
      },
    },
  }),
  useClient: () => ({
    rest: {
      v1: {
        statuses: { create: mockCreate },
      },
    },
  }),
}));

// Mock @repo/ui
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

// Mock clearAllCaches
vi.mock('../useDataHelpers', () => ({
  clearAllCaches: vi.fn(),
}));

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

beforeEach(() => {
  _resetPostsState();
  mockCreate.mockReset();
  mockToastSuccess.mockClear();
  mockToastError.mockClear();
});

afterEach(() => {
  _resetPostsState();
});

describe('usePosts', () => {
  describe('addPost — placeholder creation', () => {
    it('creates a placeholder status with temp id', () => {
      const { addPost } = usePosts();
      const result = addPost({ content: 'Hello world' });

      expect(result.id).toMatch(/^temp-/);
      expect(result.content).toBe('<p>Hello world</p>');
      expect(result.visibility).toBe('public');
      expect(result.account.acct).toBe('testuser@example.com');
    });

    it('adds placeholder to userPosts at the start', () => {
      const { addPost, userPosts } = usePosts();
      addPost({ content: 'First' });
      addPost({ content: 'Second' });

      expect(userPosts).toHaveLength(2);
      expect(userPosts[0]!.content).toBe('<p>Second</p>');
      expect(userPosts[1]!.content).toBe('<p>First</p>');
    });

    it('uses provided visibility', () => {
      const { addPost } = usePosts();
      const result = addPost({ content: 'Private post', visibility: 'private' });
      expect(result.visibility).toBe('private');
    });

    it('includes spoiler text when provided', () => {
      const { addPost } = usePosts();
      const result = addPost({ content: 'Spoiler content', spoilerText: 'CW: spoiler' });
      expect(result.spoilerText).toBe('CW: spoiler');
    });

    it('sets reply fields when provided', () => {
      const { addPost } = usePosts();
      const result = addPost({
        content: 'Reply',
        inReplyToId: 'status-42',
        inReplyToAccountId: 'acct-7',
      });
      expect(result.inReplyToId).toBe('status-42');
      expect(result.inReplyToAccountId).toBe('acct-7');
    });

    it('defaults reply fields to null', () => {
      const { addPost } = usePosts();
      const result = addPost({ content: 'Not a reply' });
      expect(result.inReplyToId).toBeNull();
      expect(result.inReplyToAccountId).toBeNull();
    });
  });

  describe('addPost — HTML escaping', () => {
    it('escapes ampersands', () => {
      const { addPost } = usePosts();
      const result = addPost({ content: 'A & B' });
      expect(result.content).toBe('<p>A &amp; B</p>');
    });

    it('escapes angle brackets', () => {
      const { addPost } = usePosts();
      const result = addPost({ content: '<script>alert("xss")</script>' });
      expect(result.content).toBe('<p>&lt;script&gt;alert("xss")&lt;/script&gt;</p>');
    });

    it('converts newlines to <br>', () => {
      const { addPost } = usePosts();
      const result = addPost({ content: 'Line 1\nLine 2\nLine 3' });
      expect(result.content).toBe('<p>Line 1<br>Line 2<br>Line 3</p>');
    });
  });

  describe('addPost — API integration', () => {
    it('replaces placeholder with real status on API success', async () => {
      const realStatus = { id: 'real-123', content: '<p>Hello world</p>' } as Status;
      mockCreate.mockResolvedValue(realStatus);

      const { addPost, userPosts } = usePosts();
      const placeholder = addPost({ content: 'Hello world' });

      expect(userPosts[0]!.id).toBe(placeholder.id);

      await flushPromises();

      expect(userPosts[0]!.id).toBe('real-123');
      expect(mockToastSuccess).toHaveBeenCalledWith('Post published');
    });

    it('removes placeholder on API failure', async () => {
      mockCreate.mockRejectedValue(new Error('Network error'));

      const { addPost, userPosts } = usePosts();
      addPost({ content: 'Will fail' });

      expect(userPosts).toHaveLength(1);

      await flushPromises();

      expect(userPosts).toHaveLength(0);
      expect(mockToastError).toHaveBeenCalledWith('Failed to post', 'Please try again.');
    });

    it('passes correct options to API', async () => {
      mockCreate.mockResolvedValue({ id: 'real-1' } as Status);

      const { addPost } = usePosts();
      addPost({
        content: 'Test post',
        spoilerText: 'CW',
        visibility: 'unlisted',
        inReplyToId: 'reply-to-42',
      });

      await flushPromises();

      expect(mockCreate).toHaveBeenCalledWith({
        status: 'Test post',
        spoilerText: 'CW',
        visibility: 'unlisted',
        inReplyToId: 'reply-to-42',
      });
    });

    it('omits empty spoilerText and inReplyToId', async () => {
      mockCreate.mockResolvedValue({ id: 'real-1' } as Status);

      const { addPost } = usePosts();
      addPost({ content: 'Simple post' });

      await flushPromises();

      expect(mockCreate).toHaveBeenCalledWith({
        status: 'Simple post',
        spoilerText: undefined,
        visibility: 'public',
        inReplyToId: undefined,
      });
    });
  });

  describe('addPost — unique IDs', () => {
    it('generates unique temp IDs for each post', () => {
      const { addPost } = usePosts();
      const post1 = addPost({ content: 'A' });
      const post2 = addPost({ content: 'B' });
      const post3 = addPost({ content: 'C' });

      expect(post1.id).not.toBe(post2.id);
      expect(post2.id).not.toBe(post3.id);
    });
  });
});
