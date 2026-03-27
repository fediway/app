import type { Status } from '@repo/types';
import { flushPromises } from '@repo/config/vitest/helpers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { _resetQueryCache } from '../../../src/composables/createQuery';
import { _resetPostsState, usePosts } from '../../../src/composables/queries/usePosts';

// Mock useClient — can be toggled to throw for no-auth tests
const mockCreate = vi.fn();
let clientAvailable = true;
vi.mock('../../../src/composables/useClient', () => ({
  useClient: () => {
    if (!clientAvailable)
      throw new Error('Not authenticated');
    return {
      rest: {
        v1: {
          statuses: { create: mockCreate },
        },
      },
    };
  },
}));

// Mock useAuth
vi.mock('../../../src/composables/useAuth', () => ({
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
}));

beforeEach(() => {
  _resetPostsState();
  _resetQueryCache();
  mockCreate.mockReset();
  clientAvailable = true;
});

afterEach(() => {
  _resetPostsState();
  _resetQueryCache();
});

describe('usePosts (shared)', () => {
  describe('addPost — placeholder creation', () => {
    it('creates a placeholder status with temp id', () => {
      const { addPost } = usePosts();
      const result = addPost({ content: 'Hello world' });

      expect(result.id).toMatch(/^temp-/);
      expect(result.content).toBe('<p>Hello world</p>');
      expect(result.visibility).toBe('public');
    });

    it('adds placeholder to userPosts at the start', () => {
      const { addPost, userPosts } = usePosts();
      addPost({ content: 'First' });
      addPost({ content: 'Second' });

      expect(userPosts).toHaveLength(2);
      expect(userPosts[0]!.content).toBe('<p>Second</p>');
      expect(userPosts[1]!.content).toBe('<p>First</p>');
    });

    it('escapes HTML in content', () => {
      const { addPost } = usePosts();
      const result = addPost({ content: '<script>alert("xss")</script>' });
      expect(result.content).toBe('<p>&lt;script&gt;alert("xss")&lt;/script&gt;</p>');
    });

    it('generates unique temp IDs', () => {
      const { addPost } = usePosts();
      const a = addPost({ content: 'A' });
      const b = addPost({ content: 'B' });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('addPost — API integration', () => {
    it('replaces placeholder with real status on success', async () => {
      const realStatus = { id: 'real-123', content: '<p>Hello world</p>' } as Status;
      mockCreate.mockResolvedValue(realStatus);

      const onPublished = vi.fn();
      const { addPost, userPosts } = usePosts({ onPublished });
      addPost({ content: 'Hello world' });

      await flushPromises();

      expect(userPosts[0]!.id).toBe('real-123');
      expect(onPublished).toHaveBeenCalledWith(realStatus);
    });

    it('removes placeholder on API failure', async () => {
      mockCreate.mockRejectedValue(new Error('Network error'));

      const onError = vi.fn();
      const { addPost, userPosts } = usePosts({ onError });
      addPost({ content: 'Will fail' });

      expect(userPosts).toHaveLength(1);
      await flushPromises();

      expect(userPosts).toHaveLength(0);
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
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

    it('passes poll data to API when provided', async () => {
      mockCreate.mockResolvedValue({ id: 'real-poll-1' } as Status);

      const { addPost } = usePosts();
      addPost({
        content: 'What is your favorite framework?',
        poll: {
          options: ['Vue', 'React', 'Svelte'],
          expiresIn: 86400,
          multiple: false,
        },
      });

      await flushPromises();

      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        status: 'What is your favorite framework?',
        poll: {
          options: ['Vue', 'React', 'Svelte'],
          expiresIn: 86400,
          multiple: false,
        },
      }));
    });

    it('passes mediaIds to API when provided', async () => {
      mockCreate.mockResolvedValue({ id: 'real-media-1' } as Status);

      const { addPost } = usePosts();
      addPost({
        content: 'Check out this photo',
        mediaIds: ['media-1', 'media-2'],
      });

      await flushPromises();

      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        status: 'Check out this photo',
        mediaIds: ['media-1', 'media-2'],
      }));
    });

    it('does not include poll or mediaIds when not provided', async () => {
      mockCreate.mockResolvedValue({ id: 'real-plain-1' } as Status);

      const { addPost } = usePosts();
      addPost({ content: 'Simple post' });

      await flushPromises();

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs).not.toHaveProperty('poll');
      expect(callArgs).not.toHaveProperty('mediaIds');
    });
  });

  describe('callbacks', () => {
    it('calls onPublished on success', async () => {
      const realStatus = { id: 'real-1' } as Status;
      mockCreate.mockResolvedValue(realStatus);

      const onPublished = vi.fn();
      const { addPost } = usePosts({ onPublished });
      addPost({ content: 'Hello' });

      await flushPromises();
      expect(onPublished).toHaveBeenCalledWith(realStatus);
    });

    it('calls onError on failure', async () => {
      mockCreate.mockRejectedValue(new Error('fail'));

      const onError = vi.fn();
      const { addPost } = usePosts({ onError });
      addPost({ content: 'Hello' });

      await flushPromises();
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('works without callbacks (no crash)', async () => {
      mockCreate.mockResolvedValue({ id: 'real-1' } as Status);

      const { addPost } = usePosts();
      addPost({ content: 'Hello' });

      await flushPromises();
      // No error thrown
    });
  });

  describe('no client (unauthenticated)', () => {
    it('removes placeholder immediately when no client', () => {
      clientAvailable = false;

      const { addPost, userPosts } = usePosts();
      addPost({ content: 'Hello' });

      // Placeholder was added then immediately removed
      expect(userPosts).toHaveLength(0);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('still returns the placeholder (for caller reference)', () => {
      clientAvailable = false;

      const { addPost } = usePosts();
      const result = addPost({ content: 'Hello' });

      expect(result.id).toMatch(/^temp-/);
      expect(result.content).toBe('<p>Hello</p>');
    });
  });
});
