import type { Notification } from '@repo/types';
import type { MockState } from '../state';
import { mockNotifications } from '../fixtures';
import { delay } from '../utils';

export function createNotificationsHandler(_state: MockState) {
  return {
    async list(params?: { limit?: number; maxId?: string; types?: string[] }) {
      await delay();
      let result = mockNotifications as Notification[];
      if (params?.types?.length) {
        result = result.filter(n => params.types!.includes(n.type));
      }
      if (params?.maxId) {
        const idx = result.findIndex(n => n.id === params.maxId);
        result = idx !== -1 ? result.slice(idx + 1) : [];
      }
      return result.slice(0, params?.limit ?? 30);
    },
  };
}

export function createMarkersHandler(state: MockState) {
  return {
    async fetch(_params?: { timeline?: string[] }) {
      await delay();
      return {
        notifications: {
          lastReadId: state.mockMarkerLastReadId,
          last_read_id: state.mockMarkerLastReadId,
          version: 0,
          updatedAt: new Date().toISOString(),
        },
      };
    },
    async create(params: Record<string, any>) {
      await delay();
      if (params.notifications?.lastReadId) {
        state.mockMarkerLastReadId = params.notifications.lastReadId;
      }
      return {};
    },
  };
}
