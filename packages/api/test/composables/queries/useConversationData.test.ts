import type { Conversation, Status } from '@repo/types';
import { flushPromises } from '@repo/config/vitest/helpers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { _resetQueryCache } from '../../../src/composables/createQuery';

// Mock API client
const mockConversationsList = vi.fn();
const mockConversationRead = vi.fn();
const mockContextFetch = vi.fn();
const mockStatusCreate = vi.fn();

vi.mock('../../../src/composables/useClient', () => ({
  useClient: () => ({
    rest: {
      v1: {
        conversations: {
          list: mockConversationsList,
          $select: (_id: string) => ({
            read: mockConversationRead,
          }),
        },
        statuses: {
          create: mockStatusCreate,
          $select: (_id: string) => ({
            context: { fetch: mockContextFetch },
          }),
        },
      },
    },
  }),
}));

vi.mock('../../../src/composables/useAuth', () => ({
  useAuth: () => ({
    currentUser: { value: { acct: 'me@example.com', username: 'me' } },
  }),
}));

function makeConversation(id: string, acct: string): Conversation {
  return {
    id,
    accounts: [{
      id: `acct-${id}`,
      acct,
      displayName: acct.split('@')[0],
      avatar: `https://example.com/${acct}.png`,
      username: acct.split('@')[0],
    }],
    lastStatus: {
      id: `status-${id}`,
      content: '<p>Last message</p>',
      createdAt: '2024-01-01T00:00:00Z',
      account: { acct, displayName: acct.split('@')[0] },
      visibility: 'direct',
    },
    unread: false,
  } as unknown as Conversation;
}

function makeStatus(id: string, acct: string, content: string, url?: string): Status {
  return {
    id,
    content: `<p>${content}</p>`,
    createdAt: '2024-01-01T00:00:00Z',
    account: { acct, displayName: acct.split('@')[0] },
    visibility: 'direct',
    url: url ?? `https://example.com/statuses/${id}`,
    uri: `https://example.com/statuses/${id}`,
  } as unknown as Status;
}

beforeEach(() => {
  _resetQueryCache();
  mockConversationsList.mockReset();
  mockConversationRead.mockReset();
  mockContextFetch.mockReset();
  mockStatusCreate.mockReset();
});

afterEach(() => {
  _resetQueryCache();
});

describe('useConversationData', () => {
  async function getComposable() {
    const { useConversationData } = await import('../../../src/composables/queries/useConversationData');
    return useConversationData();
  }

  describe('getConversations', () => {
    it('fetches and returns conversations', async () => {
      const convs = [makeConversation('1', 'alice@example.com'), makeConversation('2', 'bob@example.com')];
      mockConversationsList.mockResolvedValue(convs);

      const { getConversations } = await getComposable();
      const { data, isLoading } = getConversations();

      expect(isLoading.value).toBe(true);
      await flushPromises();

      expect(data.value).toHaveLength(2);
      expect(data.value[0]!.id).toBe('1');
      expect(isLoading.value).toBe(false);
    });

    it('sets error on API failure', async () => {
      mockConversationsList.mockRejectedValue(new Error('Network error'));

      const { getConversations } = await getComposable();
      const { error } = getConversations();

      await flushPromises();

      expect(error.value).toBeInstanceOf(Error);
      expect(error.value!.message).toBe('Network error');
    });

    it('returns empty array as default', async () => {
      mockConversationsList.mockImplementation(() => new Promise(() => {}));

      const { getConversations } = await getComposable();
      const { data } = getConversations();

      expect(data.value).toEqual([]);
    });
  });

  describe('getConversationDetail', () => {
    it('fetches conversation and assembles thread in order', async () => {
      const conv = makeConversation('1', 'alice@example.com');
      mockConversationRead.mockResolvedValue(conv);
      mockContextFetch.mockResolvedValue({
        ancestors: [makeStatus('a1', 'alice@example.com', 'First message')],
        descendants: [makeStatus('d1', 'me@example.com', 'Reply')],
      });

      const { getConversationDetail } = await getComposable();
      const { data } = getConversationDetail('1');

      await flushPromises();

      expect(data.value.conversation?.id).toBe('1');
      expect(data.value.messages).toHaveLength(3);
      // Order: ancestors -> lastStatus -> descendants
      expect(data.value.messages[0]!.id).toBe('a1');
      expect(data.value.messages[1]!.id).toBe('status-1');
      expect(data.value.messages[2]!.id).toBe('d1');
    });

    it('returns empty messages when conversation has no lastStatus', async () => {
      const conv = { id: '1', accounts: [], lastStatus: null, unread: false } as unknown as Conversation;
      mockConversationRead.mockResolvedValue(conv);

      const { getConversationDetail } = await getComposable();
      const { data } = getConversationDetail('1');

      await flushPromises();

      expect(data.value.conversation).toBeTruthy();
      expect(data.value.messages).toEqual([]);
      expect(mockContextFetch).not.toHaveBeenCalled();
    });

    it('sets error when conversation not found', async () => {
      mockConversationRead.mockRejectedValue(new Error('Conversation not found'));

      const { getConversationDetail } = await getComposable();
      const { error } = getConversationDetail('999');

      await flushPromises();

      expect(error.value).toBeInstanceOf(Error);
    });

    it('sets error when context fetch fails', async () => {
      const conv = makeConversation('1', 'alice@example.com');
      mockConversationRead.mockResolvedValue(conv);
      mockContextFetch.mockRejectedValue(new Error('Context unavailable'));

      const { getConversationDetail } = await getComposable();
      const { error } = getConversationDetail('1');

      await flushPromises();

      expect(error.value).toBeInstanceOf(Error);
      expect(error.value!.message).toBe('Context unavailable');
    });

    it('handles empty context (only lastStatus)', async () => {
      const conv = makeConversation('1', 'alice@example.com');
      mockConversationRead.mockResolvedValue(conv);
      mockContextFetch.mockResolvedValue({ ancestors: [], descendants: [] });

      const { getConversationDetail } = await getComposable();
      const { data } = getConversationDetail('1');

      await flushPromises();

      expect(data.value.messages).toHaveLength(1);
      expect(data.value.messages[0]!.id).toBe('status-1');
    });
  });

  describe('sendDirectMessage', () => {
    it('creates a status with direct visibility and @mention', async () => {
      const created = makeStatus('new-1', 'me@example.com', '@alice Hello');
      mockStatusCreate.mockResolvedValue(created);

      const { sendDirectMessage } = await getComposable();
      const result = await sendDirectMessage('alice@example.com', 'Hello');

      expect(mockStatusCreate).toHaveBeenCalledWith({
        status: '@alice@example.com Hello',
        visibility: 'direct',
      });
      expect(result.id).toBe('new-1');
    });

    it('propagates API errors to caller', async () => {
      mockStatusCreate.mockRejectedValue(new Error('Forbidden'));

      const { sendDirectMessage } = await getComposable();

      await expect(sendDirectMessage('alice@example.com', 'Hello'))
        .rejects
        .toThrow('Forbidden');
    });
  });

  describe('shareStatus', () => {
    it('sends message + status URL when custom message provided', async () => {
      mockStatusCreate.mockResolvedValue(makeStatus('new-1', 'me', 'msg'));

      const sharedStatus = makeStatus('shared-1', 'bob@example.com', 'Cool post');
      const { shareStatus } = await getComposable();
      await shareStatus('alice@example.com', 'Check this out', sharedStatus);

      const call = mockStatusCreate.mock.calls[0]![0];
      expect(call.status).toContain('@alice@example.com');
      expect(call.status).toContain('Check this out');
      expect(call.status).toContain('https://example.com/statuses/shared-1');
      expect(call.visibility).toBe('direct');
    });

    it('uses content preview when no custom message', async () => {
      mockStatusCreate.mockResolvedValue(makeStatus('new-1', 'me', 'msg'));

      const sharedStatus = makeStatus('shared-1', 'bob@example.com', 'Great post about testing');
      const { shareStatus } = await getComposable();
      await shareStatus('alice@example.com', '', sharedStatus);

      const call = mockStatusCreate.mock.calls[0]![0];
      expect(call.status).toContain('Great post about testing');
      expect(call.status).toContain('https://example.com/statuses/shared-1');
      // Should NOT contain empty message at start
      expect(call.status).not.toMatch(/^@alice@example.com \n/);
    });

    it('handles status with no URL gracefully', async () => {
      mockStatusCreate.mockResolvedValue(makeStatus('new-1', 'me', 'msg'));

      const sharedStatus = {
        ...makeStatus('shared-1', 'bob@example.com', 'A post'),
        url: null,
        uri: '',
      } as unknown as Status;

      const { shareStatus } = await getComposable();
      await shareStatus('alice@example.com', 'Look at this', sharedStatus);

      const call = mockStatusCreate.mock.calls[0]![0];
      expect(call.status).toContain('Look at this');
      // Should not contain "undefined" or "null"
      expect(call.status).not.toContain('undefined');
      expect(call.status).not.toContain('null');
    });
  });

  describe('isOwnMessage', () => {
    it('returns true when status is from current user', async () => {
      const status = makeStatus('1', 'me@example.com', 'My message');
      const { isOwnMessage } = await getComposable();
      expect(isOwnMessage(status)).toBe(true);
    });

    it('returns false when status is from another user', async () => {
      const status = makeStatus('1', 'alice@example.com', 'Their message');
      const { isOwnMessage } = await getComposable();
      expect(isOwnMessage(status)).toBe(false);
    });

    it('returns false when status is from a third party in group DM', async () => {
      const status = makeStatus('1', 'bob@example.com', 'Third party message');
      const { isOwnMessage } = await getComposable();
      expect(isOwnMessage(status)).toBe(false);
    });
  });

  // Note: formatMessageContent and stripHtml are tested in packages/api/test/utils/html.test.ts
  // The composable re-exports them from @repo/api -- no need to duplicate tests here.
});
