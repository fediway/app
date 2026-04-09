import type { FediwayStatus } from '@repo/types';
import type { mastodon } from 'masto';
import type { MastoClient, MastoClientConfig } from '../client';
import type { CreateStatusParams, FediwayAPI } from '../fediway-api';
import { escapeHtml } from '../utils/html';
import {
  currentUserAccount,
  mockItemAggregations,
} from './fixtures';
import { createAccountsHandler } from './handlers/accounts';
import { createConversationsHandler } from './handlers/conversations';
import { createMediaHandler } from './handlers/media';
import {
  createBlocksHandler,
  createBookmarksHandler,
  createDomainBlocksHandler,
  createFavouritesHandler,
  createFiltersHandler,
  createMutesHandler,
  createReportsHandler,
} from './handlers/moderation';
import { createMarkersHandler, createNotificationsHandler } from './handlers/notifications';
import {
  createDirectoryHandler,
  createSearchHandler,
  createSuggestionsHandler,
  createTrendsHandler,
} from './handlers/search';
import { createStatusesHandler } from './handlers/statuses';
import { createTimelinesHandler } from './handlers/timelines';
import { createMockState } from './state';
import { delay, getNextFediwayId } from './utils';

export function createMockClient(): MastoClient {
  const state = createMockState();

  const instanceRules = [
    { id: '1', text: 'No spam or advertising', hint: 'Do not post unsolicited advertisements or spam content.' },
    { id: '2', text: 'No harassment or abuse', hint: 'Be respectful to other users.' },
    { id: '3', text: 'No illegal content', hint: 'Do not post content that violates applicable laws.' },
    { id: '4', text: 'Use content warnings', hint: 'Use CW for sensitive or potentially triggering content.' },
  ];

  const rest = {
    v1: {
      customEmojis: {
        async list() {
          await delay();
          return [
            { shortcode: 'fediway', url: '/images/app-icon-transparent.svg', staticUrl: '/images/app-icon-transparent.svg', visibleInPicker: true, category: 'Fediway' },
            { shortcode: 'blobcat', url: 'https://cdn.mastodon.social/emoji/blobcat.png', staticUrl: 'https://cdn.mastodon.social/emoji/blobcat.png', visibleInPicker: true, category: 'Blobs' },
            { shortcode: 'blobfox', url: 'https://cdn.mastodon.social/emoji/blobfox.png', staticUrl: 'https://cdn.mastodon.social/emoji/blobfox.png', visibleInPicker: true, category: 'Blobs' },
            { shortcode: 'verified', url: 'https://cdn.mastodon.social/emoji/verified.png', staticUrl: 'https://cdn.mastodon.social/emoji/verified.png', visibleInPicker: true, category: 'Status' },
          ];
        },
      },
      timelines: createTimelinesHandler(state),
      statuses: createStatusesHandler(state),
      accounts: createAccountsHandler(state),
      notifications: createNotificationsHandler(state),
      markers: createMarkersHandler(state),
      conversations: createConversationsHandler(),
      favourites: createFavouritesHandler(),
      bookmarks: createBookmarksHandler(),
      trends: createTrendsHandler(),
      directory: createDirectoryHandler(),
      blocks: createBlocksHandler(state),
      mutes: createMutesHandler(state),
      domainBlocks: createDomainBlocksHandler(state),
      reports: createReportsHandler(state),
    },
    v2: {
      search: createSearchHandler(state),
      media: createMediaHandler(),
      suggestions: createSuggestionsHandler(),
      instance: {
        async fetch() {
          await delay();
          return {
            domain: 'mock.fediway.local',
            title: 'Fediway Mock',
            version: '4.3.0',
            rules: instanceRules,
          };
        },
      },
      filters: createFiltersHandler(state),
    },
  } as unknown as mastodon.rest.Client;

  const fediway: FediwayAPI = {
    async createStatus(params: CreateStatusParams): Promise<FediwayStatus> {
      await delay();
      const id = getNextFediwayId();
      const status: FediwayStatus = {
        id,
        uri: `https://social.network/statuses/${id}`,
        createdAt: new Date().toISOString(),
        editedAt: null,
        account: currentUserAccount,
        content: `<p>${escapeHtml(params.status)}</p>`,
        visibility: (params.visibility ?? 'public') as FediwayStatus['visibility'],
        sensitive: false,
        spoilerText: '',
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
        inReplyToId: null,
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
        item: params.itemUrl
          ? {
              url: params.itemUrl,
              type: (params.itemType as import('@repo/types').ItemType) || 'link',
              title: params.itemUrl,
            }
          : undefined,
        rating: params.rating ? { value: params.rating } : undefined,
      } as FediwayStatus;

      state.timelineStatuses.unshift(status);
      return status;
    },

    async getItem(url: string) {
      await delay();
      const aggregation = mockItemAggregations[url];
      if (!aggregation)
        throw new Error(`Item not found: ${url}`);
      return aggregation;
    },

    async getItemStatuses(url: string) {
      await delay();
      const aggregation = mockItemAggregations[url];
      if (!aggregation)
        return [];
      return [...aggregation.friendsTakes, ...aggregation.recentTakes];
    },
  };

  const config: MastoClientConfig = {
    url: 'https://mock.fediway.local',
  };

  return {
    rest,
    streaming: undefined,
    fediway,
    config,
    isAuthenticated: false,
  };
}
