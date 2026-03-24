import type { Conversation, Status } from '@repo/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useConversationData } from '../useConversationData';
import { _resetDataHelpers } from '../useDataHelpers';

// Mock API client
const mockConversationsList = vi.fn();
const mockConversationRead = vi.fn();
const mockContextFetch = vi.fn();
const mockStatusCreate = vi.fn();

vi.mock('@repo/api', () => ({
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
  useAuth: () => ({
    currentUser: { value: { acct: 'me@example.com', username: 'me' } },
  }),
}));

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

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
  _resetDataHelpers();
  mockConversationsList.mockReset();
  mockConversationRead.mockReset();
  mockContextFetch.mockReset();
  mockStatusCreate.mockReset();
});

afterEach(() => {
  _resetDataHelpers();
});

describe('useConversationData', () => {
  describe('getConversations', () => {
    it('fetches and returns conversations', async () => {
      const convs = [makeConversation('1', 'alice@example.com'), makeConversation('2', 'bob@example.com')];
      mockConversationsList.mockResolvedValue(convs);

      const { getConversations } = useConversationData();
      const { data, isLoading } = getConversations();

      expect(isLoading.value).toBe(true);
      await flushPromises();

      expect(data.value).toHaveLength(2);
      expect(data.value[0]!.id).toBe('1');
      expect(isLoading.value).toBe(false);
    });

    it('sets error on API failure', async () => {
      mockConversationsList.mockRejectedValue(new Error('Network error'));

      const { getConversations } = useConversationData();
      const { error } = getConversations();

      await flushPromises();

      expect(error.value).toBeInstanceOf(Error);
      expect(error.value!.message).toBe('Network error');
    });

    it('returns empty array as default', () => {
      mockConversationsList.mockImplementation(() => new Promise(() => {}));

      const { getConversations } = useConversationData();
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

      const { getConversationDetail } = useConversationData();
      const { data } = getConversationDetail('1');

      await flushPromises();

      expect(data.value.conversation?.id).toBe('1');
      expect(data.value.messages).toHaveLength(3);
      // Order: ancestors → lastStatus → descendants
      expect(data.value.messages[0]!.id).toBe('a1');
      expect(data.value.messages[1]!.id).toBe('status-1');
      expect(data.value.messages[2]!.id).toBe('d1');
    });

    it('returns empty messages when conversation has no lastStatus', async () => {
      const conv = { id: '1', accounts: [], lastStatus: null, unread: false } as unknown as Conversation;
      mockConversationRead.mockResolvedValue(conv);

      const { getConversationDetail } = useConversationData();
      const { data } = getConversationDetail('1');

      await flushPromises();

      expect(data.value.conversation).toBeTruthy();
      expect(data.value.messages).toEqual([]);
      expect(mockContextFetch).not.toHaveBeenCalled();
    });

    it('sets error when conversation not found', async () => {
      mockConversationRead.mockRejectedValue(new Error('Conversation not found'));

      const { getConversationDetail } = useConversationData();
      const { error } = getConversationDetail('999');

      await flushPromises();

      expect(error.value).toBeInstanceOf(Error);
    });

    it('sets error when context fetch fails', async () => {
      const conv = makeConversation('1', 'alice@example.com');
      mockConversationRead.mockResolvedValue(conv);
      mockContextFetch.mockRejectedValue(new Error('Context unavailable'));

      const { getConversationDetail } = useConversationData();
      const { error } = getConversationDetail('1');

      await flushPromises();

      expect(error.value).toBeInstanceOf(Error);
      expect(error.value!.message).toBe('Context unavailable');
    });

    it('handles empty context (only lastStatus)', async () => {
      const conv = makeConversation('1', 'alice@example.com');
      mockConversationRead.mockResolvedValue(conv);
      mockContextFetch.mockResolvedValue({ ancestors: [], descendants: [] });

      const { getConversationDetail } = useConversationData();
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

      const { sendDirectMessage } = useConversationData();
      const result = await sendDirectMessage('alice@example.com', 'Hello');

      expect(mockStatusCreate).toHaveBeenCalledWith({
        status: '@alice@example.com Hello',
        visibility: 'direct',
      });
      expect(result.id).toBe('new-1');
    });

    it('propagates API errors to caller', async () => {
      mockStatusCreate.mockRejectedValue(new Error('Forbidden'));

      const { sendDirectMessage } = useConversationData();

      await expect(sendDirectMessage('alice@example.com', 'Hello'))
        .rejects
        .toThrow('Forbidden');
    });
  });

  describe('shareStatus', () => {
    it('sends message + status URL when custom message provided', async () => {
      mockStatusCreate.mockResolvedValue(makeStatus('new-1', 'me', 'msg'));

      const sharedStatus = makeStatus('shared-1', 'bob@example.com', 'Cool post');
      const { shareStatus } = useConversationData();
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
      const { shareStatus } = useConversationData();
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

      const { shareStatus } = useConversationData();
      await shareStatus('alice@example.com', 'Look at this', sharedStatus);

      const call = mockStatusCreate.mock.calls[0]![0];
      expect(call.status).toContain('Look at this');
      // Should not contain "undefined" or "null"
      expect(call.status).not.toContain('undefined');
      expect(call.status).not.toContain('null');
    });
  });

  describe('isOwnMessage', () => {
    it('returns true when status is from current user', () => {
      const status = makeStatus('1', 'me@example.com', 'My message');
      const { isOwnMessage } = useConversationData();
      expect(isOwnMessage(status)).toBe(true);
    });

    it('returns false when status is from another user', () => {
      const status = makeStatus('1', 'alice@example.com', 'Their message');
      const { isOwnMessage } = useConversationData();
      expect(isOwnMessage(status)).toBe(false);
    });

    it('returns false when status is from a third party in group DM', () => {
      const status = makeStatus('1', 'bob@example.com', 'Third party message');
      const { isOwnMessage } = useConversationData();
      expect(isOwnMessage(status)).toBe(false);
    });
  });

  describe('formatMessageContent', () => {
    it('strips leading participant mention from DM', () => {
      const { formatMessageContent } = useConversationData();
      expect(formatMessageContent(
        '<p>@alice@example.com Sure, let\'s chat.</p>',
        ['alice@example.com'],
      )).toBe('Sure, let\'s chat.');
    });

    it('strips short-form mention (local part only)', () => {
      const { formatMessageContent } = useConversationData();
      expect(formatMessageContent(
        '<p>@alice Sure, let\'s chat.</p>',
        ['alice@example.com'],
      )).toBe('Sure, let\'s chat.');
    });

    it('strips multiple leading participant mentions in group DM', () => {
      const { formatMessageContent } = useConversationData();
      expect(formatMessageContent(
        '<p>@alice @bob Hey both of you!</p>',
        ['alice@example.com', 'bob@example.com'],
      )).toBe('Hey both of you!');
    });

    it('preserves non-participant mentions at the start', () => {
      const { formatMessageContent } = useConversationData();
      expect(formatMessageContent(
        '<p>@charlie Have you seen this?</p>',
        ['alice@example.com'],
      )).toBe('@charlie Have you seen this?');
    });

    it('preserves participant mentions mid-message', () => {
      const { formatMessageContent } = useConversationData();
      expect(formatMessageContent(
        '<p>I agree with @alice on this</p>',
        ['alice@example.com'],
      )).toBe('I agree with @alice on this');
    });

    it('handles message that is only a mention (returns empty)', () => {
      const { formatMessageContent } = useConversationData();
      expect(formatMessageContent(
        '<p>@alice@example.com</p>',
        ['alice@example.com'],
      )).toBe('');
    });

    it('handles Mastodon HTML mention markup', () => {
      const { formatMessageContent } = useConversationData();
      // Real Mastodon mention HTML
      const html = '<p><span class="h-card"><a href="https://example.com/@alice" class="u-url mention">@<span>alice</span></a></span> Sure, let\'s chat.</p>';
      expect(formatMessageContent(html, ['alice@example.com'])).toBe('Sure, let\'s chat.');
    });

    it('decodes entities after stripping mentions', () => {
      const { formatMessageContent } = useConversationData();
      expect(formatMessageContent(
        '<p>@alice Tom &amp; Jerry</p>',
        ['alice@example.com'],
      )).toBe('Tom & Jerry');
    });

    it('works with empty participant list (no stripping)', () => {
      const { formatMessageContent } = useConversationData();
      expect(formatMessageContent(
        '<p>@alice Hello</p>',
        [],
      )).toBe('@alice Hello');
    });
  });

  describe('stripHtml', () => {
    it('removes HTML tags', () => {
      const { stripHtml } = useConversationData();
      expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
    });

    it('decodes named HTML entities', () => {
      const { stripHtml } = useConversationData();
      expect(stripHtml('Tom &amp; Jerry')).toBe('Tom & Jerry');
      expect(stripHtml('&lt;script&gt;')).toBe('<script>');
      expect(stripHtml('She said &quot;hello&quot;')).toBe('She said "hello"');
    });

    it('decodes numeric HTML entities', () => {
      const { stripHtml } = useConversationData();
      expect(stripHtml('&#39;quotes&#39;')).toBe('\'quotes\'');
      expect(stripHtml('&#x27;hex&#x27;')).toBe('\'hex\'');
    });

    it('handles tags + entities together', () => {
      const { stripHtml } = useConversationData();
      expect(stripHtml('<p>Tom &amp; Jerry &lt;3</p>')).toBe('Tom & Jerry <3');
    });

    it('handles empty string', () => {
      const { stripHtml } = useConversationData();
      expect(stripHtml('')).toBe('');
    });

    it('returns plain text unchanged', () => {
      const { stripHtml } = useConversationData();
      expect(stripHtml('No HTML here')).toBe('No HTML here');
    });
  });
});
