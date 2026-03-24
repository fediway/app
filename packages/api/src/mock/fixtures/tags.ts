import type { Tag } from '@repo/types';

function makeHistory(uses: number, accounts: number) {
  const now = new Date();
  return [
    { day: String(Math.floor(now.getTime() / 1000)), uses: String(uses), accounts: String(accounts) },
    { day: String(Math.floor((now.getTime() - 86400000) / 1000)), uses: String(Math.floor(uses * 0.8)), accounts: String(Math.floor(accounts * 0.7)) },
  ];
}

export const trendingTags: Tag[] = [
  { id: 'trend-1', name: 'photography', url: '/tags/photography', history: makeHistory(342, 128) },
  { id: 'trend-2', name: 'coding', url: '/tags/coding', history: makeHistory(281, 95) },
  { id: 'trend-3', name: 'coffee', url: '/tags/coffee', history: makeHistory(198, 72) },
  { id: 'trend-4', name: 'nature', url: '/tags/nature', history: makeHistory(176, 64) },
  { id: 'trend-5', name: 'music', url: '/tags/music', history: makeHistory(154, 58) },
  { id: 'trend-6', name: 'design', url: '/tags/design', history: makeHistory(132, 45) },
  { id: 'trend-7', name: 'webdev', url: '/tags/webdev', history: makeHistory(118, 41) },
  { id: 'trend-8', name: 'travel', url: '/tags/travel', history: makeHistory(97, 34) },
  { id: 'trend-9', name: 'foodie', url: '/tags/foodie', history: makeHistory(85, 29) },
  { id: 'trend-10', name: 'fitness', url: '/tags/fitness', history: makeHistory(63, 22) },
];
