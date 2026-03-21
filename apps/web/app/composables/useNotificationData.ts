import type { Notification } from '@repo/types';
import type { DataResult } from './useDataHelpers';
import { useClient } from '@repo/api';
import { createDataResult } from './useDataHelpers';

export function useNotificationData() {
  const client = useClient();

  function getNotifications(): DataResult<Notification[]> {
    return createDataResult('notifications', [] as Notification[], async () => {
      const result = await client.rest.v1.notifications.list({ limit: 30 });
      return result as Notification[];
    });
  }

  return { getNotifications };
}
