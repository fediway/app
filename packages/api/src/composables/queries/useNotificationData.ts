import type { Notification } from '@repo/types';
import type { PaginatedQueryResult } from '../createPaginatedQuery';
import type { QueryResult } from '../createQuery';
import { createPaginatedQuery } from '../createPaginatedQuery';
import { createQuery } from '../createQuery';
import { useClient } from '../useClient';

/** Mastodon notification filter types */
export const NOTIFICATION_FILTERS = {
  mentions: { label: 'Mentions', types: ['mention'] },
  follows: { label: 'Follows', types: ['follow'] },
  favourites: { label: 'Likes', types: ['favourite'] },
  reblogs: { label: 'Reposts', types: ['reblog'] },
} as const;

export type NotificationFilter = keyof typeof NOTIFICATION_FILTERS;

export function useNotificationData() {
  const client = useClient();

  function getNotifications(filter?: NotificationFilter): QueryResult<Notification[]> {
    const types = filter ? NOTIFICATION_FILTERS[filter].types : undefined;
    const baseKey = filter ? `notifications:${filter}` : 'notifications';

    return createQuery(baseKey, [] as Notification[], async () => {
      const result = await client.rest.v1.notifications.list({
        limit: 30,
        ...(types ? { types: [...types] } : {}),
      });
      return result as Notification[];
    });
  }

  function getNotificationsPaginated(filter?: NotificationFilter): PaginatedQueryResult<Notification> {
    const types = filter ? NOTIFICATION_FILTERS[filter].types : undefined;
    const baseKey = filter ? `notifications:${filter}:paginated` : 'notifications:paginated';

    return createPaginatedQuery(baseKey, async ({ limit, maxId }) => {
      const result = await client.rest.v1.notifications.list({
        limit,
        maxId,
        ...(types ? { types: [...types] } : {}),
      });
      return result as Notification[];
    });
  }

  return { getNotifications, getNotificationsPaginated };
}
