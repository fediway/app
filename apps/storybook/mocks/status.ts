import type { Status } from '@repo/types';
import { createMockAccount } from './account';

let counter = 0;

const BASE_STATUS: Status = {
  id: '1',
  uri: 'https://mastodon.social/users/alice/statuses/1',
  createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  editedAt: null,
  account: createMockAccount({ id: '100', username: 'alice', displayName: 'Alice Chen' }),
  content: '<p>Just finished <strong>Piranesi</strong> by <a href="https://books.social/@SusannaClarke" class="mention">@<span>SusannaClarke</span></a>. The way she builds atmosphere through negative space is extraordinary.</p><p>Reminded me of <a href="https://books.social/@Borges" class="mention">@<span>Borges</span></a> at his most labyrinthine. <a href="/tags/BookReview" class="hashtag">#<span>BookReview</span></a> <a href="/tags/Fantasy" class="hashtag">#<span>Fantasy</span></a></p>',
  visibility: 'public',
  sensitive: false,
  spoilerText: '',
  mediaAttachments: [],
  application: { name: 'Fediway', website: null },
  mentions: [],
  tags: [
    { name: 'BookReview', url: '/tags/BookReview' },
    { name: 'Fantasy', url: '/tags/Fantasy' },
  ],
  emojis: [],
  reblogsCount: 5,
  favouritesCount: 23,
  repliesCount: 3,
  url: 'https://mastodon.social/@alice/1',
  reblog: null,
  poll: null,
  card: null,
  language: 'en',
  favourited: false,
  reblogged: false,
  muted: false,
  bookmarked: false,
  pinned: false,
  quotesCount: 0,
  quoteApproval: { state: 'pending' },
  quote: null,
  filtered: [],
};

export function createMockStatus(overrides?: Partial<Status>): Status {
  counter++;
  const id = overrides?.id ?? String(counter);
  return {
    ...BASE_STATUS,
    id,
    uri: `https://mastodon.social/users/alice/statuses/${id}`,
    url: `https://mastodon.social/@alice/${id}`,
    account: overrides?.account ?? createMockAccount({ id: '100', username: 'alice', displayName: 'Alice Chen' }),
    ...overrides,
  };
}
