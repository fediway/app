import type { Notification } from '@repo/types';
import type { NotificationGroup } from '@/components/notification/groupNotifications';
import { createMockAccount } from './account';
import { createMockStatus } from './status';

let counter = 0;

type NotificationType = 'favourite' | 'reblog' | 'follow' | 'follow_request' | 'mention' | 'status' | 'poll' | 'update' | 'quote';

export function createMockNotification(
  type: NotificationType,
  overrides?: Partial<Notification>,
): Notification {
  counter++;
  const id = overrides?.id ?? String(counter);
  const account = overrides?.account ?? createMockAccount();

  const base = {
    id,
    type,
    createdAt: new Date(Date.now() - counter * 300000).toISOString(),
    account,
    groupKey: `ungrouped-${id}`,
  };

  if (type === 'follow' || type === 'follow_request') {
    return { ...base, status: undefined, report: undefined, ...overrides } as Notification;
  }

  return {
    ...base,
    status: createMockStatus(),
    report: undefined,
    ...overrides,
  } as Notification;
}

export function createMockNotificationGroup(
  type: NotificationType,
  accountCount: number = 1,
  overrides?: Partial<NotificationGroup>,
): NotificationGroup {
  counter++;
  const accounts = Array.from({ length: accountCount }, (_, i) =>
    createMockAccount({
      displayName: ['Alice Chen', 'Bob Smith', 'Carol Davis', 'Dave Wilson', 'Eve Brown'][i % 5],
      username: ['alice', 'bob', 'carol', 'dave', 'eve'][i % 5],
    }));

  const hasStatus = type !== 'follow' && type !== 'follow_request';

  return {
    id: `group-${counter}`,
    type,
    accounts,
    totalCount: accountCount,
    status: hasStatus ? createMockStatus() : undefined,
    createdAt: new Date(Date.now() - counter * 600000).toISOString(),
    mostRecentId: `notif-${counter}`,
    ...overrides,
  };
}
