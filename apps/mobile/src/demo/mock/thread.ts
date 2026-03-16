import type { FediwayStatus } from '@repo/types';
import { emilyAccount, janeAccount, marcusAccount, sarahAccount } from './accounts';
import { bookReviewStatus } from './statuses';

const baseReply = {
  uri: '',
  editedAt: null,
  visibility: 'public' as const,
  sensitive: false,
  spoilerText: '',
  mediaAttachments: [],
  application: { name: 'Fediway', website: null },
  mentions: [{ id: sarahAccount.id, username: sarahAccount.username, url: '', acct: sarahAccount.acct }],
  tags: [],
  emojis: [],
  reblogsCount: 0,
  favouritesCount: 0,
  repliesCount: 0,
  quote: null,
  quotesCount: 0,
  quoteApproval: { automatic: [], manual: ['public' as const], currentUser: 'automatic' as const },
  reblog: null,
  poll: null,
  card: null,
  language: 'en',
  favourited: false,
  reblogged: false,
  muted: false,
  bookmarked: false,
  pinned: false,
  inReplyToId: bookReviewStatus.id,
  inReplyToAccountId: sarahAccount.id,
} satisfies Partial<FediwayStatus>;

// Ancestor: a post Sarah replied to before the review
export const threadAncestor: FediwayStatus = {
  ...baseReply,
  id: 'ta1',
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  account: janeAccount,
  content: '<p>Anyone read Dune recently? Thinking about picking it up.</p>',
  mentions: [],
  inReplyToId: null,
  inReplyToAccountId: null,
  favouritesCount: 6,
  repliesCount: 1,
};

// Root status is bookReviewStatus (Sarah's review)

// Descendants (replies to Sarah's review)
export const threadReply1: FediwayStatus = {
  ...baseReply,
  id: 'tr1',
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  account: marcusAccount,
  content: '<p><span class="h-card"><a href="#" class="mention">@sarah</a></span> The political intrigue is the best part! Herbert basically predicted social media tribalism decades early.</p>',
  favouritesCount: 8,
  repliesCount: 1,
};

export const threadReply2: FediwayStatus = {
  ...baseReply,
  id: 'tr2',
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  account: janeAccount,
  content: '<p><span class="h-card"><a href="#" class="mention">@sarah</a></span> This convinced me, adding it to my list right now.</p>',
  favouritesCount: 3,
};

export const threadReply3: FediwayStatus = {
  ...baseReply,
  id: 'tr3',
  createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  account: emilyAccount,
  content: '<p><span class="h-card"><a href="#" class="mention">@sarah</a></span> Only 4 stars? This is easily a 5 for me. The sandworm riding scene alone!</p>',
  favouritesCount: 5,
  repliesCount: 0,
};

export const threadAncestors: FediwayStatus[] = [threadAncestor];
export const threadRoot = bookReviewStatus;
export const threadDescendants: FediwayStatus[] = [threadReply1, threadReply2, threadReply3];
