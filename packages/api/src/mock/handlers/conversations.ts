import type { Conversation } from '@repo/types';
import { mockConversations } from '../fixtures';
import { delay } from '../utils';

export function createConversationsHandler() {
  return {
    async list() {
      await delay();
      return mockConversations as Conversation[];
    },
    $select(id: string) {
      return {
        async read() {
          await delay();
          const conv = mockConversations.find(c => c.id === id);
          if (!conv)
            throw new Error(`Conversation ${id} not found`);
          return { ...conv, unread: false };
        },
      };
    },
  };
}
