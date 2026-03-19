import type { Status } from '@repo/types';
import { createMockAccount } from './account';

let counter = 0;

const BASE_STATUS: Status = {
  id: '1',
  uri: 'https://mastodon.social/users/alice/statuses/1',
  createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  editedAt: null,
  account: createMockAccount({ id: '100', username: 'alice', displayName: 'Alice Chen' }),
  content: '<p>Just discovered an amazing new open source project. The fediverse keeps getting better!</p>',
  visibility: 'public',
  sensitive: false,
  spoilerText: '',
  mediaAttachments: [],
  application: { name: 'Fediway', website: null },
  mentions: [],
  tags: [],
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
