import type { Notification } from '@repo/types';
import type { DataResult } from './useDataHelpers';
import { useClient } from '@repo/api';
import { createDataResult } from './useDataHelpers';

/** Mastodon notification filter types */
export const NOTIFICATION_FILTERS = {
  mentions: { label: 'Mentions', types: ['mention'] },
  follows: { label: 'Follows', types: ['follow'] },
  favourites: { label: 'Favourites', types: ['favourite'] },
  reblogs: { label: 'Boosts', types: ['reblog'] },
} as const;

export type NotificationFilter = keyof typeof NOTIFICATION_FILTERS;

export function useNotificationData() {
  const client = useClient();

  function getNotifications(filter?: NotificationFilter): DataResult<Notification[]> {
    const types = filter ? NOTIFICATION_FILTERS[filter].types : undefined;
    const key = filter ? `notifications:${filter}` : 'notifications';

    return createDataResult(key, [] as Notification[], async () => {
      const result = await client.rest.v1.notifications.list({
        limit: 30,
        ...(types ? { types: [...types] } : {}),
      });
      return result as Notification[];
    });
  }

  return { getNotifications };
}
