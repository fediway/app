import type { Account, Notification, Status } from '@repo/types';
import { describe, expect, it } from 'vitest';
import { groupNotifications } from '../groupNotifications';

function mockAccount(id: string, name: string): Account {
  return { id, username: name, acct: `${name}@test.social`, displayName: name } as Account;
}

function mockStatus(id: string): Status {
  return { id, content: '<p>Test</p>', mediaAttachments: [], tags: [], emojis: [], mentions: [] } as unknown as Status;
}

function mockNotification(id: string, type: string, account: Account, status?: Status): Notification {
  return { id, type, account, status, createdAt: new Date(Date.now() - Number(id) * 1000).toISOString(), groupKey: `ungrouped-${id}` } as Notification;
}

const alice = mockAccount('1', 'alice');
const bob = mockAccount('2', 'bob');
const carol = mockAccount('3', 'carol');
const post1 = mockStatus('100');
const post2 = mockStatus('200');

describe('groupNotifications', () => {
  it('groups favourites on the same status', () => {
    const notifications = [
      mockNotification('3', 'favourite', alice, post1),
      mockNotification('2', 'favourite', bob, post1),
      mockNotification('1', 'favourite', carol, post1),
    ];

    const groups = groupNotifications(notifications);
    expect(groups).toHaveLength(1);
    expect(groups[0]!.accounts).toHaveLength(3);
    expect(groups[0]!.totalCount).toBe(3);
    expect(groups[0]!.type).toBe('favourite');
    expect(groups[0]!.status?.id).toBe('100');
  });

  it('does not group favourites on different statuses', () => {
    const notifications = [
      mockNotification('2', 'favourite', alice, post1),
      mockNotification('1', 'favourite', bob, post2),
    ];

    const groups = groupNotifications(notifications);
    expect(groups).toHaveLength(2);
  });

  it('groups reblogs on the same status', () => {
    const notifications = [
      mockNotification('2', 'reblog', alice, post1),
      mockNotification('1', 'reblog', bob, post1),
    ];

    const groups = groupNotifications(notifications);
    expect(groups).toHaveLength(1);
    expect(groups[0]!.accounts).toHaveLength(2);
    expect(groups[0]!.type).toBe('reblog');
  });

  it('does not group different types on the same status', () => {
    const notifications = [
      mockNotification('2', 'favourite', alice, post1),
      mockNotification('1', 'reblog', bob, post1),
    ];

    const groups = groupNotifications(notifications);
    expect(groups).toHaveLength(2);
  });

  it('does not group mentions (each is unique)', () => {
    const notifications = [
      mockNotification('2', 'mention', alice, post1),
      mockNotification('1', 'mention', bob, post2),
    ];

    const groups = groupNotifications(notifications);
    expect(groups).toHaveLength(2);
  });

  it('deduplicates accounts in a group', () => {
    const notifications = [
      mockNotification('2', 'favourite', alice, post1),
      mockNotification('1', 'favourite', alice, post1),
    ];

    const groups = groupNotifications(notifications);
    expect(groups).toHaveLength(1);
    expect(groups[0]!.accounts).toHaveLength(1);
    expect(groups[0]!.totalCount).toBe(2);
  });

  it('tracks the most recent notification id', () => {
    const notifications = [
      mockNotification('5', 'favourite', alice, post1),
      mockNotification('3', 'favourite', bob, post1),
    ];

    const groups = groupNotifications(notifications);
    expect(groups[0]!.mostRecentId).toBe('5');
  });

  it('preserves order of first occurrence', () => {
    const notifications = [
      mockNotification('4', 'reblog', alice, post1),
      mockNotification('3', 'favourite', bob, post2),
      mockNotification('2', 'reblog', carol, post1),
    ];

    const groups = groupNotifications(notifications);
    expect(groups).toHaveLength(2);
    expect(groups[0]!.type).toBe('reblog');
    expect(groups[1]!.type).toBe('favourite');
  });

  it('returns empty array for empty input', () => {
    expect(groupNotifications([])).toEqual([]);
  });

  it('handles follow notifications as separate groups', () => {
    const notifications = [
      mockNotification('2', 'follow', alice),
      mockNotification('1', 'follow', bob),
    ];

    const groups = groupNotifications(notifications);
    expect(groups).toHaveLength(2);
  });
});
