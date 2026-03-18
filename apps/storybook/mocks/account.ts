import type { Account } from '@repo/types';

let counter = 0;

const BASE_ACCOUNT: Account = {
  id: '1',
  username: 'alice',
  acct: 'alice@mastodon.social',
  url: 'https://mastodon.social/@alice',
  displayName: 'Alice Chen',
  note: '<p>Software developer & open source enthusiast. Building on the fediverse.</p>',
  avatar: 'https://picsum.photos/seed/alice/200/200',
  avatarStatic: 'https://picsum.photos/seed/alice/200/200',
  header: 'https://picsum.photos/seed/alice-header/800/300',
  headerStatic: 'https://picsum.photos/seed/alice-header/800/300',
  locked: false,
  fields: [],
  emojis: [],
  bot: false,
  group: false,
  discoverable: true,
  createdAt: '2023-01-15T00:00:00.000Z',
  lastStatusAt: '2025-03-15',
  statusesCount: 890,
  followersCount: 1234,
  followingCount: 567,
  roles: [],
};

export function createMockAccount(overrides?: Partial<Account>): Account {
  counter++;
  const id = overrides?.id ?? String(counter);
  const username = overrides?.username ?? `user${counter}`;
  return {
    ...BASE_ACCOUNT,
    id,
    username,
    acct: `${username}@mastodon.social`,
    url: `https://mastodon.social/@${username}`,
    avatar: `https://picsum.photos/seed/${username}/200/200`,
    avatarStatic: `https://picsum.photos/seed/${username}/200/200`,
    header: `https://picsum.photos/seed/${username}-header/800/300`,
    headerStatic: `https://picsum.photos/seed/${username}-header/800/300`,
    ...overrides,
  };
}
