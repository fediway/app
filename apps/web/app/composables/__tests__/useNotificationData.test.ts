import type { Notification } from '@repo/types';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { _resetDataHelpers } from '../useDataHelpers';

const mockListNotifications = vi.fn();

vi.mock('@repo/api', () => ({
  useClient: () => ({
    rest: {
      v1: {
        notifications: { list: mockListNotifications },
      },
    },
  }),
}));

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

afterEach(() => {
  _resetDataHelpers();
  mockListNotifications.mockReset();
});

function makeNotification(id: string, type: string): Notification {
  return { id, type } as Notification;
}

describe('useNotificationData', () => {
  async function getComposable() {
    const mod = await import('../useNotificationData');
    return mod.useNotificationData();
  }

  async function getExports() {
    return await import('../useNotificationData');
  }

  describe('getNotifications', () => {
    it('returns all notifications without filter', async () => {
      const notifications = [makeNotification('1', 'mention'), makeNotification('2', 'follow')];
      mockListNotifications.mockResolvedValue(notifications);

      const { getNotifications } = await getComposable();
      const result = getNotifications();

      await flushPromises();

      expect(result.data.value).toEqual(notifications);
      expect(mockListNotifications).toHaveBeenCalledWith({ limit: 30 });
    });

    it('returns filtered notifications for mentions', async () => {
      const notifications = [makeNotification('1', 'mention')];
      mockListNotifications.mockResolvedValue(notifications);

      const { getNotifications } = await getComposable();
      const result = getNotifications('mentions');

      await flushPromises();

      expect(result.data.value).toEqual(notifications);
      expect(mockListNotifications).toHaveBeenCalledWith({ limit: 30, types: ['mention'] });
    });

    it('returns filtered notifications for follows', async () => {
      const notifications = [makeNotification('2', 'follow')];
      mockListNotifications.mockResolvedValue(notifications);

      const { getNotifications } = await getComposable();
      const result = getNotifications('follows');

      await flushPromises();

      expect(result.data.value).toEqual(notifications);
      expect(mockListNotifications).toHaveBeenCalledWith({ limit: 30, types: ['follow'] });
    });
  });

  describe('nOTIFICATION_FILTERS', () => {
    it('exports correct filter definitions', async () => {
      const { NOTIFICATION_FILTERS } = await getExports();

      expect(NOTIFICATION_FILTERS).toEqual({
        mentions: { label: 'Mentions', types: ['mention'] },
        follows: { label: 'Follows', types: ['follow'] },
        favourites: { label: 'Favourites', types: ['favourite'] },
        reblogs: { label: 'Boosts', types: ['reblog'] },
      });
    });
  });

  describe('caching', () => {
    it('same filter returns cached refs', async () => {
      mockListNotifications.mockResolvedValue([makeNotification('1', 'mention')]);

      const { getNotifications } = await getComposable();
      const result1 = getNotifications('mentions');

      await flushPromises();

      const result2 = getNotifications('mentions');

      expect(result1.data).toBe(result2.data);
      expect(result2.data.value).toEqual([makeNotification('1', 'mention')]);
    });

    it('different filters get separate cache keys', async () => {
      const mentionNotifs = [makeNotification('1', 'mention')];
      const followNotifs = [makeNotification('2', 'follow')];
      mockListNotifications
        .mockResolvedValueOnce(mentionNotifs)
        .mockResolvedValueOnce(followNotifs);

      const { getNotifications } = await getComposable();
      const result1 = getNotifications('mentions');
      const result2 = getNotifications('follows');

      await flushPromises();

      expect(result1.data.value).toEqual(mentionNotifs);
      expect(result2.data.value).toEqual(followNotifs);
      expect(result1.data).not.toBe(result2.data);
    });
  });
});
