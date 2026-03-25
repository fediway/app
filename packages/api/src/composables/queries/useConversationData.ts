import type { Conversation, Status } from '@repo/types';
import type { QueryResult } from '../createQuery';
import { formatMessageContent, stripHtml } from '../../utils/html';
import { createQuery } from '../createQuery';
import { useAuth } from '../useAuth';
import { useClient } from '../useClient';

export interface ConversationDetail {
  conversation: Conversation | null;
  messages: Status[];
}

export function useConversationData() {
  const client = useClient();
  const { currentUser } = useAuth();

  function getConversations(): QueryResult<Conversation[]> {
    return createQuery('conversations', [] as Conversation[], async () => {
      return await client.rest.v1.conversations.list({ limit: 40 });
    });
  }

  function getConversationDetail(conversationId: string): QueryResult<ConversationDetail> {
    return createQuery<ConversationDetail>(
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

  async function sendDirectMessage(recipientAcct: string, content: string, inReplyToId?: string): Promise<Status> {
    const status = await client.rest.v1.statuses.create({
      status: `@${recipientAcct} ${content}`,
      visibility: 'direct',
      ...(inReplyToId ? { inReplyToId } : {}),
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

  return {
    getConversations,
    getConversationDetail,
    sendDirectMessage,
    shareStatus,
    isOwnMessage,
    formatMessageContent,
  };
}
