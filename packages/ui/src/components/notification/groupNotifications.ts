import type { Account, Notification, Status } from '@repo/types';

export interface NotificationGroup {
  id: string;
  type: string;
  accounts: Account[];
  totalCount: number;
  status?: Status;
  createdAt: string;
  mostRecentId: string;
}

export function groupNotifications(notifications: Notification[]): NotificationGroup[] {
  const groups: NotificationGroup[] = [];
  const groupMap = new Map<string, NotificationGroup>();

  for (const n of notifications) {
    const key = groupKey(n);
    const existing = groupMap.get(key);

    if (existing) {
      if (!existing.accounts.some(a => a.id === n.account.id)) {
        existing.accounts.push(n.account);
      }
      existing.totalCount++;
      if (n.id > existing.mostRecentId) {
        existing.mostRecentId = n.id;
        existing.createdAt = n.createdAt;
      }
    }
    else {
      const group: NotificationGroup = {
        id: key,
        type: n.type,
        accounts: [n.account],
        totalCount: 1,
        status: n.status ?? undefined,
        createdAt: n.createdAt,
        mostRecentId: n.id,
      };
      groupMap.set(key, group);
      groups.push(group);
    }
  }

  return groups;
}

function groupKey(n: Notification): string {
  if (n.status && (n.type === 'favourite' || n.type === 'reblog')) {
    return `${n.type}:${n.status.id}`;
  }
  if (n.type === 'follow') {
    return `follow:${n.groupKey ?? n.id}`;
  }
  return `${n.type}:${n.id}`;
}
