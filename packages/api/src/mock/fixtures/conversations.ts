import type { Conversation, Status } from '@repo/types';
import { emilyAccount, janeAccount, marcusAccount, sarahAccount } from './accounts';

function createConversation(
  id: string,
  accounts: typeof janeAccount[],
  lastStatusContent: string,
  lastStatusDate: string,
  unread: boolean,
  lastStatusAuthor?: typeof janeAccount,
): Conversation {
  const author = lastStatusAuthor ?? accounts[0]!;
  const lastStatus: Status = {
    id: `dm-status-${id}`,
    createdAt: lastStatusDate,
    editedAt: null,
    content: `<p>${lastStatusContent}</p>`,
    visibility: 'direct',
    sensitive: false,
    spoilerText: '',
    uri: `https://social.network/statuses/dm-${id}`,
    url: `https://social.network/@${author?.username}/dm-${id}`,
    repliesCount: 0,
    reblogsCount: 0,
    favouritesCount: 0,
    quotesCount: 0,
    quoteApproval: { automatic: [], manual: [], currentUser: 'unknown' },
    favourited: false,
    reblogged: false,
    bookmarked: false,
    muted: false,
    pinned: false,
    account: author,
    application: { name: 'Fediway' },
    mediaAttachments: [],
    mentions: [],
    tags: [],
    emojis: [],
    language: 'en',
  };
  return { id, accounts, unread, lastStatus };
}

export const mockConversations: Conversation[] = [
  createConversation(
    '1',
    [sarahAccount],
    'Hey! Did you see the new design system we shipped? The team did an amazing job on the token system.',
    '2024-03-15T14:30:00.000Z',
    true,
  ),
  createConversation(
    '2',
    [marcusAccount],
    'Sounds good, let me know when it\'s ready for another look!',
    '2024-03-15T12:30:00.000Z',
    true,
    janeAccount,
  ),
  createConversation(
    '3',
    [emilyAccount],
    'The photography meetup is next Saturday at Golden Gate Park. You in? 📷',
    '2024-03-14T20:45:00.000Z',
    false,
  ),
];

export const mockMessages: Record<string, Array<{ id: string; content: string; accountId: string; createdAt: string; favourited?: boolean }>> = {
  1: [
    { id: 'msg-1-1', content: 'Hey Jane! How are you?', accountId: sarahAccount.id, createdAt: '2024-03-15T10:00:00.000Z' },
    { id: 'msg-1-2', content: 'Hey Sarah! I\'m good, just working on the mobile app 🚀', accountId: janeAccount.id, createdAt: '2024-03-15T10:05:00.000Z' },
    { id: 'msg-1-3', content: 'Nice! How\'s the navigation refactor going?', accountId: sarahAccount.id, createdAt: '2024-03-15T10:10:00.000Z' },
    { id: 'msg-1-4', content: 'Almost done — shared components are looking really clean now', accountId: janeAccount.id, createdAt: '2024-03-15T10:15:00.000Z' },
    { id: 'msg-1-5', content: 'Did you see the new design system we shipped? The team did an amazing job on the token system.', accountId: sarahAccount.id, createdAt: '2024-03-15T14:30:00.000Z' },
  ],
  2: [
    { id: 'msg-2-1', content: 'Hey Marcus, left some comments on your PR', accountId: janeAccount.id, createdAt: '2024-03-15T09:00:00.000Z' },
    { id: 'msg-2-2', content: 'Thanks! Let me take a look', accountId: marcusAccount.id, createdAt: '2024-03-15T09:30:00.000Z' },
    { id: 'msg-2-3', content: 'Good catches on the error handling — I missed those edge cases', accountId: marcusAccount.id, createdAt: '2024-03-15T11:00:00.000Z' },
    { id: 'msg-2-4', content: 'Thanks for the code review feedback — I\'ll push the fixes this afternoon.', accountId: marcusAccount.id, createdAt: '2024-03-15T12:15:00.000Z' },
  ],
  3: [
    { id: 'msg-3-1', content: 'Emily! Long time no talk 👋', accountId: janeAccount.id, createdAt: '2024-03-14T18:00:00.000Z' },
    { id: 'msg-3-2', content: 'Jane!! How have you been?', accountId: emilyAccount.id, createdAt: '2024-03-14T18:30:00.000Z' },
    { id: 'msg-3-3', content: 'Great! Been super busy with work but loving it', accountId: janeAccount.id, createdAt: '2024-03-14T19:00:00.000Z' },
    { id: 'msg-3-4', content: 'The photography meetup is next Saturday at Golden Gate Park. You in? 📷', accountId: emilyAccount.id, createdAt: '2024-03-14T20:45:00.000Z' },
  ],
};
