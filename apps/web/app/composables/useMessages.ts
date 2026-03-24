import type { Account, Status } from '@repo/types';
import { reactive } from 'vue';

const HTML_TAG_RE = /<[^>]*>/g;

export interface SharedStatus {
  id: string;
  authorName: string;
  authorAcct: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
}

export interface Message {
  id: string;
  content: string;
  sentAt: string;
  isOwn: boolean;
  sharedStatus?: SharedStatus;
  favourited?: boolean;
}

export interface Conversation {
  id: string;
  participant: {
    displayName: string;
    acct: string;
    avatar: string;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

// Module-level state
const conversations = reactive<Conversation[]>([
  {
    id: '1',
    participant: {
      displayName: 'Sarah Chen',
      acct: 'sarah@social.network',
      avatar: 'https://picsum.photos/seed/sarah/100/100',
    },
    lastMessage: 'That sounds amazing! Let me know when you want to meet up.',
    lastMessageAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    unreadCount: 2,
  },
  {
    id: '2',
    participant: {
      displayName: 'Marcus Johnson',
      acct: 'marcus.j@federated.social',
      avatar: 'https://picsum.photos/seed/marcus/100/100',
    },
    lastMessage: 'Check out this post!',
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
  },
  {
    id: '3',
    participant: {
      displayName: 'Emily Rodriguez',
      acct: 'emily_r@mastodon.social',
      avatar: 'https://picsum.photos/seed/emily/100/100',
    },
    lastMessage: 'Thanks for sharing that article!',
    lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
  },
]);

const messagesByConversation = reactive<Record<string, Message[]>>({
  1: [
    { id: '1', content: 'Hey! Did you see the sunset yesterday? It was incredible!', sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), isOwn: false },
    { id: '2', content: 'Yes! I actually captured some photos. Let me share one with you.', sentAt: new Date(Date.now() - 1.9 * 60 * 60 * 1000).toISOString(), isOwn: true, favourited: true },
    { id: '3', content: 'Check out this post I made about it!', sentAt: new Date(Date.now() - 1.8 * 60 * 60 * 1000).toISOString(), isOwn: true, sharedStatus: { id: 'status-1', authorName: 'Jane Doe', authorAcct: 'jane@social.network', authorAvatar: 'https://picsum.photos/seed/jane/100/100', content: 'Golden hour at the beach. Sometimes the best photos happen when you least expect them.', imageUrl: 'https://picsum.photos/seed/sunset-post/400/300' } },
    { id: '4', content: 'Wow, that photo is stunning!', sentAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), isOwn: false },
    { id: '5', content: 'We should go there together sometime. The beach is only 20 minutes away.', sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), isOwn: false },
    { id: '6', content: 'That sounds amazing! Let me know when you want to meet up.', sentAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), isOwn: false },
    { id: '7', content: 'How about this Saturday morning? We could catch the sunrise instead!', sentAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), isOwn: true },
  ],
  2: [
    { id: '1', content: 'Hey, working on anything cool?', sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), isOwn: true },
    { id: '2', content: 'Check out this post!', sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), isOwn: false },
  ],
  3: [
    { id: '1', content: 'Thanks for sharing that article!', sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), isOwn: false },
  ],
});

let nextConversationId = 100;
let nextMessageId = 1000;

function stripHtml(html: string): string {
  return html.replace(HTML_TAG_RE, '').trim();
}

export function useMessages() {
  function getConversations(): Conversation[] {
    return conversations;
  }

  function getMessages(conversationId: string): Message[] {
    return messagesByConversation[conversationId] ?? [];
  }

  function getParticipant(conversationId: string) {
    const conv = conversations.find(c => c.id === conversationId);
    return conv?.participant ?? null;
  }

  function sendMessage(conversationId: string, content: string, sharedStatus?: SharedStatus) {
    if (!messagesByConversation[conversationId]) {
      messagesByConversation[conversationId] = [];
    }

    const msg: Message = {
      id: String(nextMessageId++),
      content,
      sentAt: new Date().toISOString(),
      isOwn: true,
      sharedStatus,
    };

    messagesByConversation[conversationId].push(msg);

    // Update conversation's last message
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.lastMessage = sharedStatus ? `Shared a post: ${content || stripHtml(sharedStatus.content).slice(0, 50)}` : content;
      conv.lastMessageAt = msg.sentAt;
      // Move to top of list
      const idx = conversations.indexOf(conv);
      if (idx > 0) {
        conversations.splice(idx, 1);
        conversations.unshift(conv);
      }
    }

    return msg;
  }

  /** Find or create a conversation with the given accounts, return conversation ID */
  function findOrCreateConversation(recipients: Account[]): string {
    // For simplicity, use the first recipient
    const recipient = recipients[0];
    if (!recipient)
      return '1';

    // Find existing conversation with this participant
    const existing = conversations.find(c =>
      c.participant.acct === recipient.acct,
    );
    if (existing)
      return existing.id;

    // Create new conversation
    const id = String(nextConversationId++);
    const newConv: Conversation = {
      id,
      participant: {
        displayName: recipient.displayName,
        acct: recipient.acct,
        avatar: recipient.avatar,
      },
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    };

    conversations.unshift(newConv);
    messagesByConversation[id] = [];
    return id;
  }

  /** Send a status as a message to recipients — returns the conversation ID */
  function shareStatus(recipients: Account[], message: string, status: Status): string {
    const conversationId = findOrCreateConversation(recipients);

    const shared: SharedStatus = {
      id: status.id,
      authorName: status.account.displayName,
      authorAcct: status.account.acct,
      authorAvatar: status.account.avatar,
      content: stripHtml(status.content),
      imageUrl: status.mediaAttachments[0]?.previewUrl ?? undefined,
    };

    sendMessage(conversationId, message, shared);
    return conversationId;
  }

  function markAsRead(conversationId: string) {
    const conv = conversations.find(c => c.id === conversationId);
    if (conv)
      conv.unreadCount = 0;
  }

  return {
    getConversations,
    getMessages,
    getParticipant,
    sendMessage,
    shareStatus,
    findOrCreateConversation,
    markAsRead,
  };
}

/** Reset all state — for testing only */
export function _resetMessagesState() {
  conversations.splice(0, conversations.length);
  for (const key of Object.keys(messagesByConversation)) {
    delete messagesByConversation[key];
  }
  nextConversationId = 100;
  nextMessageId = 1000;
}
