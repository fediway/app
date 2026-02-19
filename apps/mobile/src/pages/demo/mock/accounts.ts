import type { Account } from '@repo/types';

const baseAccount = {
  url: '',
  note: '',
  avatarStatic: '',
  headerStatic: '',
  locked: false,
  fields: [],
  emojis: [],
  bot: false,
  group: false,
  discoverable: true,
  createdAt: '2024-01-15T00:00:00.000Z',
  lastStatusAt: '2025-02-18',
  followingCount: 0,
  roles: [],
} satisfies Partial<Account>;

export const janeAccount: Account = {
  ...baseAccount,
  id: '1',
  username: 'jane',
  acct: 'jane',
  displayName: 'Jane Cooper',
  avatar: 'https://i.pravatar.cc/150?u=jane',
  header: 'https://picsum.photos/seed/jane/1200/400',
  note: '<p>Design systems &amp; coffee. Building things that feel right.</p>',
  followersCount: 342,
  followingCount: 218,
  statusesCount: 1247,
};

export const sarahAccount: Account = {
  ...baseAccount,
  id: '2',
  username: 'sarah',
  acct: 'sarah@bookworm.social',
  displayName: 'Sarah Chen',
  avatar: 'https://i.pravatar.cc/150?u=sarah',
  header: 'https://picsum.photos/seed/sarah/1200/400',
  note: '<p>Reads too many books. Opinions about all of them.</p>',
  followersCount: 891,
  followingCount: 156,
  statusesCount: 2103,
};

export const marcusAccount: Account = {
  ...baseAccount,
  id: '3',
  username: 'marcus',
  acct: 'marcus@cinema.club',
  displayName: 'Marcus Rivera',
  avatar: 'https://i.pravatar.cc/150?u=marcus',
  header: 'https://picsum.photos/seed/marcus/1200/400',
  note: '<p>Film nerd. Letterboxd refugee. Every movie is a 5 or a 1.</p>',
  followersCount: 1205,
  followingCount: 87,
  statusesCount: 3891,
};

export const emilyAccount: Account = {
  ...baseAccount,
  id: '4',
  username: 'emily',
  acct: 'emily',
  displayName: 'Emily Nakamura',
  avatar: 'https://i.pravatar.cc/150?u=emily',
  header: 'https://picsum.photos/seed/emily/1200/400',
  note: '<p>Music discovery is my love language. Playlist curator.</p>',
  followersCount: 567,
  followingCount: 432,
  statusesCount: 982,
};

export const currentUser = janeAccount;
