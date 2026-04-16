import type { Page } from '@playwright/test';
import {
  mockAccount,
  mockAccount2,
  mockConversations,
  mockCredentials,
  mockInstance,
  mockMarkers,
  mockNotifications,
  mockRelationship,
  mockRemoteAccount,
  mockStatuses,
  mockStatusesPage2,
  mockSuggestions,
  mockTrendingLinks,
  mockTrendingTags,
} from '../fixtures/mock-data';

/**
 * Set up Playwright route interception to mock all Mastodon API endpoints.
 * Uses regex patterns to match cross-origin API calls (app calls fediway.com API).
 */
export async function setupMockApi(page: Page) {
  // Catch-all: intercept ANY request to a Mastodon API endpoint
  // This must be registered FIRST — more specific routes override it
  await page.route(/\/api\//, async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes('/api/v1/trends/statuses'))
      return route.fulfill({ json: mockStatuses });
    if (url.includes('/api/v1/trends/tags'))
      return route.fulfill({ json: mockTrendingTags });
    if (url.includes('/api/v1/trends/links'))
      return route.fulfill({ json: mockTrendingLinks });

    if (url.includes('/api/v1/timelines/home')) {
      const hasMaxId = url.includes('max_id=') || url.includes('maxId=');
      return route.fulfill({ json: hasMaxId ? mockStatusesPage2 : mockStatuses });
    }
    if (url.includes('/api/v1/timelines/public')) {
      const hasMaxId = url.includes('max_id=') || url.includes('maxId=');
      return route.fulfill({ json: hasMaxId ? mockStatusesPage2 : mockStatuses });
    }
    if (url.includes('/api/v1/timelines/tag/'))
      return route.fulfill({ json: mockStatuses.slice(0, 3) });

    if (url.includes('/api/v1/notifications'))
      return route.fulfill({ json: mockNotifications });

    if (url.includes('/api/v1/markers')) {
      if (method === 'POST')
        return route.fulfill({ json: {} });
      return route.fulfill({ json: mockMarkers });
    }

    if (url.includes('/api/v1/accounts/update_credentials') && method === 'PATCH')
      return route.fulfill({ json: { ...mockCredentials, ...Object.fromEntries(new URLSearchParams(route.request().postData() || '')) } });
    if (url.includes('/api/v1/accounts/verify_credentials'))
      return route.fulfill({ json: mockCredentials });
    if (url.includes('/api/v1/accounts/lookup')) {
      const u = new URL(url);
      const acct = u.searchParams.get('acct') || '';
      if (acct.includes('bob'))
        return route.fulfill({ json: mockRemoteAccount });
      return route.fulfill({ json: acct.includes('alex') ? mockAccount2 : mockAccount });
    }
    if (url.includes('/api/v1/accounts/relationships'))
      return route.fulfill({ json: [mockRelationship] });
    if (url.match(/\/api\/v1\/accounts\/\d+\/statuses/))
      return route.fulfill({ json: mockStatuses.slice(0, 3) });
    if (url.match(/\/api\/v1\/accounts\/\d+\/followers/))
      return route.fulfill({ json: [mockAccount2] });
    if (url.match(/\/api\/v1\/accounts\/\d+\/following/))
      return route.fulfill({ json: [mockAccount] });

    if (url.includes('/api/v1/favourites'))
      return route.fulfill({ json: mockStatuses.slice(0, 2).map(s => ({ ...s, favourited: true })) });
    if (url.includes('/api/v1/bookmarks'))
      return route.fulfill({ json: mockStatuses.slice(0, 2).map(s => ({ ...s, bookmarked: true })) });

    if (url.includes('/api/v1/conversations'))
      return route.fulfill({ json: mockConversations });

    if (url.includes('/api/v2/search')) {
      return route.fulfill({
        json: {
          accounts: [mockAccount, mockAccount2],
          statuses: mockStatuses.slice(0, 3),
          hashtags: mockTrendingTags.slice(0, 2),
        },
      });
    }

    if (url.includes('/api/v2/suggestions'))
      return route.fulfill({ json: mockSuggestions });
    if (url.includes('/api/v1/directory'))
      return route.fulfill({ json: [mockAccount, mockAccount2] });

    if (url.includes('/api/v1/instance') || url.includes('/api/v2/instance'))
      return route.fulfill({ json: mockInstance });

    if (url.match(/\/api\/v1\/statuses\/\d+\/(favourite|unfavourite|reblog|unreblog|bookmark|unbookmark)/) && method === 'POST') {
      const isFav = url.includes('/favourite') && !url.includes('/unfavourite');
      const isReblog = url.includes('/reblog') && !url.includes('/unreblog');
      const isBookmark = url.includes('/bookmark') && !url.includes('/unbookmark');
      return route.fulfill({
        json: {
          ...mockStatuses[0],
          favourited: isFav || (mockStatuses[0].favourited && !url.includes('/unfavourite')),
          reblogged: isReblog || (mockStatuses[0].reblogged && !url.includes('/unreblog')),
          bookmarked: isBookmark,
        },
      });
    }

    if (url.match(/\/api\/v1\/statuses\/\d+$/) && method === 'DELETE') {
      return route.fulfill({ json: {} });
    }

    if (url.match(/\/api\/v1\/statuses\/\d+\/context/))
      return route.fulfill({ json: { ancestors: [], descendants: [mockStatuses[1]] } });
    if (url.match(/\/api\/v1\/statuses\/\d+$/))
      return route.fulfill({ json: mockStatuses[0] });

    if (url.includes('/api/v2/media') || url.includes('/api/v1/media')) {
      if (method === 'POST') {
        return route.fulfill({
          json: {
            id: `media-${Date.now()}`,
            type: 'image',
            url: 'https://placehold.co/400x300/E4A5BF/232B37?text=Uploaded',
            previewUrl: 'https://placehold.co/400x300/E4A5BF/232B37?text=Uploaded',
            description: null,
            meta: { original: { width: 400, height: 300 } },
          },
        });
      }
    }

    if (url.match(/\/api\/v1\/statuses$/) && method === 'POST') {
      return route.fulfill({
        json: {
          id: `status-${Date.now()}`,
          createdAt: new Date().toISOString(),
          content: '<p>Posted from E2E test</p>',
          account: mockAccount,
          favourited: false,
          reblogged: false,
          bookmarked: false,
          repliesCount: 0,
          reblogsCount: 0,
          favouritesCount: 0,
          visibility: 'public',
          spoilerText: '',
          mediaAttachments: [],
          mentions: [],
          tags: [],
          emojis: [],
          url: 'https://mock.social/@jane/new',
          uri: 'https://mock.social/users/jane/statuses/new',
        },
      });
    }

    if (url.match(/\/api\/v1\/accounts\/\d+\/follow$/) && method === 'POST') {
      const accountId = url.match(/\/accounts\/(\d+)\/follow/)?.[1];
      return route.fulfill({ json: { ...mockRelationship, id: accountId, following: true } });
    }
    if (url.match(/\/api\/v1\/accounts\/\d+\/unfollow$/) && method === 'POST') {
      const accountId = url.match(/\/accounts\/(\d+)\/unfollow/)?.[1];
      return route.fulfill({ json: { ...mockRelationship, id: accountId, following: false } });
    }

    if (url.match(/\/api\/v1\/accounts\/\d+\/mute$/) && method === 'POST') {
      const accountId = url.match(/\/accounts\/(\d+)\/mute/)?.[1];
      return route.fulfill({ json: { ...mockRelationship, id: accountId, muting: true } });
    }
    if (url.match(/\/api\/v1\/accounts\/\d+\/unmute$/) && method === 'POST') {
      const accountId = url.match(/\/accounts\/(\d+)\/unmute/)?.[1];
      return route.fulfill({ json: { ...mockRelationship, id: accountId, muting: false } });
    }
    if (url.match(/\/api\/v1\/accounts\/\d+\/block$/) && method === 'POST') {
      const accountId = url.match(/\/accounts\/(\d+)\/block/)?.[1];
      return route.fulfill({ json: { ...mockRelationship, id: accountId, blocking: true } });
    }
    if (url.match(/\/api\/v1\/accounts\/\d+\/unblock$/) && method === 'POST') {
      const accountId = url.match(/\/accounts\/(\d+)\/unblock/)?.[1];
      return route.fulfill({ json: { ...mockRelationship, id: accountId, blocking: false } });
    }
    if (url.includes('/api/v1/domain_blocks') && method === 'POST')
      return route.fulfill({ json: {} });
    if (url.includes('/api/v1/domain_blocks') && method === 'DELETE')
      return route.fulfill({ json: {} });
    if (url.includes('/api/v1/reports') && method === 'POST')
      return route.fulfill({ json: { id: 'report-1', action_taken: false, category: 'other' } });

    if (url.match(/\/api\/v1\/accounts\/3$/) && method === 'GET')
      return route.fulfill({ json: mockRemoteAccount });
    if (url.match(/\/api\/v1\/accounts\/2$/) && method === 'GET')
      return route.fulfill({ json: mockAccount2 });
    if (url.match(/\/api\/v1\/accounts\/1$/) && method === 'GET')
      return route.fulfill({ json: mockAccount });

    if (url.includes('/api/v1/custom_emojis'))
      return route.fulfill({ json: [] });

    if (method === 'GET')
      return route.fulfill({ json: [] });
    return route.fulfill({ json: {} });
  });
}
