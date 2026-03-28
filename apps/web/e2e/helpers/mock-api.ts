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
  mockStatuses,
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

    // ── Trending ──
    if (url.includes('/api/v1/trends/statuses'))
      return route.fulfill({ json: mockStatuses });
    if (url.includes('/api/v1/trends/tags'))
      return route.fulfill({ json: mockTrendingTags });
    if (url.includes('/api/v1/trends/links'))
      return route.fulfill({ json: mockTrendingLinks });

    // ── Timelines ──
    if (url.includes('/api/v1/timelines/home'))
      return route.fulfill({ json: mockStatuses });
    if (url.includes('/api/v1/timelines/public'))
      return route.fulfill({ json: mockStatuses });
    if (url.includes('/api/v1/timelines/tag/'))
      return route.fulfill({ json: mockStatuses.slice(0, 3) });

    // ── Notifications ──
    if (url.includes('/api/v1/notifications'))
      return route.fulfill({ json: mockNotifications });

    // ── Markers ──
    if (url.includes('/api/v1/markers')) {
      if (method === 'POST')
        return route.fulfill({ json: {} });
      return route.fulfill({ json: mockMarkers });
    }

    // ── Accounts ──
    if (url.includes('/api/v1/accounts/verify_credentials'))
      return route.fulfill({ json: mockCredentials });
    if (url.includes('/api/v1/accounts/lookup')) {
      const u = new URL(url);
      const acct = u.searchParams.get('acct') || '';
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

    // ── Favourites & Bookmarks ──
    if (url.includes('/api/v1/favourites'))
      return route.fulfill({ json: mockStatuses.slice(0, 2) });
    if (url.includes('/api/v1/bookmarks'))
      return route.fulfill({ json: mockStatuses.slice(0, 2) });

    // ── Conversations ──
    if (url.includes('/api/v1/conversations'))
      return route.fulfill({ json: mockConversations });

    // ── Search ──
    if (url.includes('/api/v2/search')) {
      return route.fulfill({
        json: {
          accounts: [mockAccount, mockAccount2],
          statuses: mockStatuses.slice(0, 3),
          hashtags: mockTrendingTags.slice(0, 2),
        },
      });
    }

    // ── Suggestions ──
    if (url.includes('/api/v2/suggestions'))
      return route.fulfill({ json: mockSuggestions });
    if (url.includes('/api/v1/directory'))
      return route.fulfill({ json: [mockAccount, mockAccount2] });

    // ── Instance ──
    if (url.includes('/api/v1/instance') || url.includes('/api/v2/instance'))
      return route.fulfill({ json: mockInstance });

    // ── Status detail ──
    if (url.match(/\/api\/v1\/statuses\/\d+\/context/))
      return route.fulfill({ json: { ancestors: [], descendants: [mockStatuses[1]] } });
    if (url.match(/\/api\/v1\/statuses\/\d+$/))
      return route.fulfill({ json: mockStatuses[0] });

    // ── Custom Emojis ──
    if (url.includes('/api/v1/custom_emojis'))
      return route.fulfill({ json: [] });

    // ── Fallback: return empty for GET, empty object for POST ──
    if (method === 'GET')
      return route.fulfill({ json: [] });
    return route.fulfill({ json: {} });
  });
}
