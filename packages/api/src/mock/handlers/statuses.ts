import type { Status } from '@repo/types';
import type { MockState } from '../state';
import { escapeHtml } from '../../utils/html';
import { currentUserAccount } from '../fixtures';
import {
  delay,
  findStatusById,
  getNextId,
  getStatusContext,
} from '../utils';

export function createStatusesHandler(state: MockState) {
  return {
    async create(params: { status: string; spoilerText?: string; visibility?: string; inReplyToId?: string }) {
      await delay();
      const id = getNextId();
      const status: Status = {
        id,
        uri: `https://social.network/statuses/${id}`,
        createdAt: new Date().toISOString(),
        editedAt: null,
        account: currentUserAccount,
        content: `<p>${escapeHtml(params.status)}</p>`,
        visibility: (params.visibility ?? 'public') as Status['visibility'],
        sensitive: false,
        spoilerText: params.spoilerText ?? '',
        mediaAttachments: [],
        application: { name: 'Fediway' },
        mentions: [],
        tags: [],
        emojis: [],
        reblogsCount: 0,
        favouritesCount: 0,
        repliesCount: 0,
        quotesCount: 0,
        quoteApproval: {
          automatic: ['public'],
          manual: [],
          currentUser: 'automatic',
        },
        url: `https://social.network/@jane/${id}`,
        inReplyToId: params.inReplyToId ?? null,
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
      } as unknown as Status;
      state.timelineStatuses.unshift(status);
      return status;
    },
    $select(id: string) {
      return {
        async fetch() {
          await delay();
          const status = findStatusById(state, id);
          if (!status)
            throw new Error(`Status ${id} not found`);
          return status;
        },
        context: {
          async fetch() {
            await delay();
            return getStatusContext(state, id);
          },
        },
        async favourite() {
          await delay();
          const status = findStatusById(state, id);
          if (status) {
            status.favourited = true;
            status.favouritesCount++;
          }
          return status!;
        },
        async unfavourite() {
          await delay();
          const status = findStatusById(state, id);
          if (status) {
            status.favourited = false;
            status.favouritesCount = Math.max(0, status.favouritesCount - 1);
          }
          return status!;
        },
        async reblog() {
          await delay();
          const status = findStatusById(state, id);
          if (status) {
            status.reblogged = true;
            status.reblogsCount++;
          }
          return status!;
        },
        async unreblog() {
          await delay();
          const status = findStatusById(state, id);
          if (status) {
            status.reblogged = false;
            status.reblogsCount = Math.max(0, status.reblogsCount - 1);
          }
          return status!;
        },
        async bookmark() {
          await delay();
          const status = findStatusById(state, id);
          if (status) {
            status.bookmarked = true;
          }
          return status!;
        },
        async unbookmark() {
          await delay();
          const status = findStatusById(state, id);
          if (status) {
            status.bookmarked = false;
          }
          return status!;
        },
        async mute() {
          await delay();
          const status = findStatusById(state, id);
          if (status) {
            state.mutedStatusIds.add(id);
            status.muted = true;
          }
          return status!;
        },
        async unmute() {
          await delay();
          const status = findStatusById(state, id);
          if (status) {
            state.mutedStatusIds.delete(id);
            status.muted = false;
          }
          return status!;
        },
        async remove() {
          await delay();
          const idx = state.timelineStatuses.findIndex(s => s.id === id);
          if (idx >= 0)
            state.timelineStatuses.splice(idx, 1);
        },
      };
    },
  };
}
