/**
 * Shared test helpers — import in any test file.
 *
 * Usage:
 *   import { flushPromises, makeStatus, makeAccount, makeRelationship } from '@repo/config/vitest/helpers';
 */

import type { Account, Conversation, FediwayStatus, Relationship, Status } from '@repo/types';

/** Flush all pending microtasks (resolved promises). */
export function flushPromises(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/** Create a minimal Status for testing. Override any field. */
export function makeStatus(id: string, overrides: Partial<Status> = {}): Status {
  return {
    id,
    uri: `https://example.com/statuses/${id}`,
    createdAt: '2024-01-01T00:00:00Z',
    editedAt: null,
    account: makeAccount(`acct-${id}`),
    content: `<p>Status ${id}</p>`,
    visibility: 'public',
    sensitive: false,
    spoilerText: '',
    mediaAttachments: [],
    application: { name: 'Test' },
    mentions: [],
    tags: [],
    emojis: [],
    reblogsCount: 0,
    favouritesCount: 0,
    repliesCount: 0,
    url: `https://example.com/statuses/${id}`,
    inReplyToId: null,
    inReplyToAccountId: null,
    reblog: null,
    poll: null,
    card: null,
    language: 'en',
    text: null,
    favourited: false,
    reblogged: false,
    muted: false,
    bookmarked: false,
    pinned: false,
    ...overrides,
  } as Status;
}

/** Create a minimal FediwayStatus for testing. Override any field. */
export function makeFediwayStatus(id: string, overrides: Partial<FediwayStatus> = {}): FediwayStatus {
  return makeStatus(id, overrides) as FediwayStatus;
}

/** Create a minimal Account for testing. Override any field. */
export function makeAccount(id: string, overrides: Partial<Account> = {}): Account {
  return {
    id,
    acct: `user-${id}@example.com`,
    username: `user-${id}`,
    displayName: `User ${id}`,
    avatar: `https://example.com/avatars/${id}.png`,
    avatarStatic: `https://example.com/avatars/${id}.png`,
    header: '',
    headerStatic: '',
    note: '',
    url: `https://example.com/@user-${id}`,
    followersCount: 0,
    followingCount: 0,
    statusesCount: 0,
    createdAt: '2024-01-01T00:00:00Z',
    emojis: [],
    fields: [],
    bot: false,
    ...overrides,
  } as Account;
}

/** Create a minimal Relationship for testing. */
export function makeRelationship(id: string, following: boolean, overrides: Partial<Relationship> = {}): Relationship {
  return {
    id,
    following,
    followedBy: false,
    blocking: false,
    blockedBy: false,
    muting: false,
    mutingNotifications: false,
    requested: false,
    requestedBy: false,
    domainBlocking: false,
    endorsed: false,
    notifying: false,
    note: '',
    ...overrides,
  } as Relationship;
}

/** Create a minimal Conversation for testing. */
export function makeConversation(id: string, participantAcct: string, overrides: Partial<Conversation> = {}): Conversation {
  return {
    id,
    accounts: [makeAccount(`conv-${id}`, { acct: participantAcct, displayName: participantAcct.split('@')[0] })],
    lastStatus: makeStatus(`status-${id}`, {
      content: '<p>Last message</p>',
      visibility: 'direct',
      account: makeAccount(`conv-${id}`, { acct: participantAcct }),
    }),
    unread: false,
    ...overrides,
  } as unknown as Conversation;
}
