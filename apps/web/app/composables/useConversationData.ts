import type { Conversation, Status } from '@repo/types';
import type { DataResult } from './useDataHelpers';
import { useAuth, useClient } from '@repo/api';
import { createDataResult } from './useDataHelpers';

const HTML_TAG_RE = /<[^>]*>/g;
const HTML_ENTITY_RE = /&([a-z]+|#\d+|#x[\da-f]+);/gi;

const ENTITY_MAP: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: '\'',
  nbsp: ' ',
};

function decodeEntity(_match: string, entity: string): string {
  // Named entity
  if (ENTITY_MAP[entity])
    return ENTITY_MAP[entity];
  // Decimal numeric entity
  if (entity.startsWith('#x'))
    return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
  if (entity.startsWith('#'))
    return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
  return _match;
}

function stripHtml(html: string): string {
  return html.replace(HTML_TAG_RE, '').replace(HTML_ENTITY_RE, decodeEntity).trim();
}

export interface ConversationDetail {
  conversation: Conversation | null;
  messages: Status[];
}

export function useConversationData() {
  const client = useClient();
  const { currentUser } = useAuth();

  function getConversations(): DataResult<Conversation[]> {
    return createDataResult('conversations', [] as Conversation[], async () => {
      return await client.rest.v1.conversations.list({ limit: 40 });
    });
  }

  function getConversationDetail(conversationId: string): DataResult<ConversationDetail> {
    return createDataResult<ConversationDetail>(
      `conversation-detail:${conversationId}`,
      { conversation: null, messages: [] },
      async () => {
        const conv = await client.rest.v1.conversations.$select(conversationId).read();

        if (!conv?.lastStatus) {
          return { conversation: conv, messages: [] };
        }

        const context = await client.rest.v1.statuses.$select(conv.lastStatus.id).context.fetch();
        const messages = [...context.ancestors, conv.lastStatus, ...context.descendants];

        return { conversation: conv, messages };
      },
    );
  }

  async function sendDirectMessage(recipientAcct: string, content: string): Promise<Status> {
    const status = await client.rest.v1.statuses.create({
      status: `@${recipientAcct} ${content}`,
      visibility: 'direct',
    });
    return status;
  }

  async function shareStatus(recipientAcct: string, message: string, sharedStatus: Status): Promise<Status> {
    const statusUrl = sharedStatus.url || sharedStatus.uri || '';
    const preview = stripHtml(sharedStatus.content).slice(0, 100);
    const parts: string[] = [];

    if (message) {
      parts.push(message);
    }
    else if (preview) {
      parts.push(preview);
    }

    if (statusUrl) {
      parts.push(statusUrl);
    }

    return await sendDirectMessage(recipientAcct, parts.join('\n\n'));
  }

  function isOwnMessage(status: Status): boolean {
    return status.account.acct === currentUser.value?.acct;
  }

  /**
   * Clean a DM status for chat display:
   * 1. Strip HTML tags
   * 2. Decode HTML entities
   * 3. Remove leading @mentions that are conversation participants (routing, not content)
   */
  function formatMessageContent(html: string, participantAccts: string[]): string {
    let text = stripHtml(html);

    // Build set of all participant accts (both full and local-part)
    // e.g. "alice@example.com" matches both "@alice@example.com" and "@alice"
    const acctSet = new Set<string>();
    for (const acct of participantAccts) {
      acctSet.add(acct.toLowerCase());
      const localPart = acct.split('@')[0];
      if (localPart)
        acctSet.add(localPart.toLowerCase());
    }

    // Strip leading @mentions that match any participant
    // Matches: @alice or @alice@example.com at the start, followed by space/newline
    const LEADING_MENTION_RE = /^@([\w.@-]+)\s*/;
    let match = LEADING_MENTION_RE.exec(text);
    while (match) {
      const mentioned = match[1]!.toLowerCase();
      if (!acctSet.has(mentioned))
        break;
      text = text.slice(match[0].length);
      match = LEADING_MENTION_RE.exec(text);
    }

    return text.trim();
  }

  return {
    getConversations,
    getConversationDetail,
    sendDirectMessage,
    shareStatus,
    isOwnMessage,
    formatMessageContent,
    stripHtml,
  };
}
