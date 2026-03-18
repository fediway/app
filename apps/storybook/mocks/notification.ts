import type { Notification } from '@repo/types';
import { createMockAccount } from './account';
import { createMockStatus } from './status';

let counter = 0;

type NotificationType = 'favourite' | 'reblog' | 'follow' | 'mention' | 'poll';

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

  if (type === 'follow') {
    return { ...base, type: 'follow', status: undefined, report: undefined, ...overrides } as Notification;
  }

  return {
    ...base,
    status: createMockStatus(),
    report: undefined,
    ...overrides,
  } as Notification;
}
