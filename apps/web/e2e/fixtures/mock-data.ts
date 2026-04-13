/**
 * Minimal mock API responses for E2E tests.
 * These are NOT the full dev mock data — just enough to verify UI renders correctly.
 */

const now = new Date().toISOString();
const hour = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

export const mockAccount = {
  id: '1',
  username: 'jane',
  acct: 'jane',
  displayName: 'Jane Doe',
  avatar: 'https://placehold.co/96x96/E4A5BF/232B37?text=JD',
  avatarStatic: 'https://placehold.co/96x96/E4A5BF/232B37?text=JD',
  header: '',
  headerStatic: '',
  note: '<p>Mock user for E2E testing</p>',
  url: 'https://mock.social/@jane',
  followersCount: 142,
  followingCount: 89,
  statusesCount: 312,
  createdAt: '2024-01-15T00:00:00.000Z',
  bot: false,
  locked: false,
  emojis: [],
  fields: [],
};

export const mockAccount2 = {
  ...mockAccount,
  id: '2',
  username: 'alex',
  acct: 'alex',
  displayName: 'Alex Chen',
  avatar: 'https://placehold.co/96x96/94AAC7/232B37?text=AC',
  avatarStatic: 'https://placehold.co/96x96/94AAC7/232B37?text=AC',
  url: 'https://mock.social/@alex',
};

/** Remote user — for testing "Block domain" visibility */
export const mockRemoteAccount = {
  ...mockAccount,
  id: '3',
  username: 'bob',
  acct: 'bob@remote.social',
  displayName: 'Bob Remote',
  avatar: 'https://placehold.co/96x96/A5C7B0/232B37?text=BR',
  avatarStatic: 'https://placehold.co/96x96/A5C7B0/232B37?text=BR',
  url: 'https://remote.social/@bob',
};

function makeStatus(id: string, content: string, account = mockAccount, extra = {}) {
  return {
    id,
    createdAt: hour(Number(id)),
    content: `<p>${content}</p>`,
    account,
    reblog: null,
    favourited: false,
    reblogged: false,
    bookmarked: false,
    repliesCount: Math.floor(Math.random() * 10),
    reblogsCount: Math.floor(Math.random() * 20),
    favouritesCount: Math.floor(Math.random() * 50),
    visibility: 'public',
    spoilerText: '',
    mediaAttachments: [],
    mentions: [],
    tags: [],
    emojis: [],
    card: null,
    poll: null,
    url: `https://mock.social/@${account.username}/${id}`,
    uri: `https://mock.social/users/${account.username}/statuses/${id}`,
    inReplyToId: null,
    inReplyToAccountId: null,
    language: 'en',
    ...extra,
  };
}

const mockImageAttachment = {
  id: 'media-1',
  type: 'image',
  url: 'https://mock.social/media/photo.jpg',
  previewUrl: 'https://mock.social/media/photo_thumb.jpg',
  description: 'A scenic photo',
  blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
  meta: { original: { width: 1200, height: 800, aspect: 1.5 } },
};

const mockGifAttachment = {
  id: 'media-gif-1',
  type: 'gifv',
  url: 'https://mock.social/media/animation.mp4',
  previewUrl: 'https://mock.social/media/animation_thumb.jpg',
  description: 'An animated GIF',
  blurhash: null,
  meta: { original: { width: 400, height: 400, aspect: 1 } },
};

export const mockStatuses = [
  makeStatus('100', 'Just finished reading <strong>Piranesi</strong>. The world-building is extraordinary. <a href="#" class="hashtag">#books</a>'),
  makeStatus('99', 'Working on a new color system today. Every hue should earn its place.', mockAccount2),
  makeStatus('98', 'The fediverse is growing. Love to see it. <a href="#" class="hashtag">#fediverse</a>', mockAccount, {
    mediaAttachments: [mockImageAttachment],
  }),
  makeStatus('97', 'Coffee and code, the perfect morning.', mockAccount2),
  makeStatus('96', 'Has anyone tried the new Mastodon release? The performance improvements are noticeable.'),
  makeStatus('95', 'Check out this GIF!', mockAccount2, {
    mediaAttachments: [mockGifAttachment],
  }),
  makeStatus('94', 'NSFW content warning', mockAccount, {
    sensitive: true,
    spoilerText: 'Content warning',
    mediaAttachments: [{ ...mockImageAttachment, id: 'media-sensitive' }],
  }),
  makeStatus('93', 'Hello from a remote instance!', mockRemoteAccount),
];

export const mockStatusesPage2 = [
  makeStatus('92', 'Page two starts here. Infinite scroll works!'),
  makeStatus('91', 'Another post from page two.', mockAccount2),
  makeStatus('90', 'Third post on page two. Keep scrolling.'),
];

export const mockNotifications = [
  { id: 'notif-1', type: 'favourite', createdAt: hour(1), account: mockAccount2, status: mockStatuses[0], groupKey: 'fav-1' },
  { id: 'notif-2', type: 'favourite', createdAt: hour(1), account: mockRemoteAccount, status: mockStatuses[0], groupKey: 'fav-1' },
  { id: 'notif-3', type: 'reblog', createdAt: hour(2), account: mockAccount2, status: mockStatuses[2], groupKey: 'reb-1' },
  { id: 'notif-4', type: 'follow', createdAt: hour(3), account: mockRemoteAccount, status: undefined, groupKey: 'fol-1' },
  { id: 'notif-5', type: 'mention', createdAt: hour(4), account: mockAccount2, status: mockStatuses[1], groupKey: 'men-1' },
];

export const mockTrendingTags = [
  { name: 'photography', url: 'https://mock.social/tags/photography', history: [{ day: '0', uses: '342', accounts: '89' }] },
  { name: 'coding', url: 'https://mock.social/tags/coding', history: [{ day: '0', uses: '281', accounts: '45' }] },
  { name: 'coffee', url: 'https://mock.social/tags/coffee', history: [{ day: '0', uses: '198', accounts: '67' }] },
  { name: 'nature', url: 'https://mock.social/tags/nature', history: [{ day: '0', uses: '176', accounts: '43' }] },
];

export const mockTrendingLinks = [
  { url: 'https://example.com/article-1', title: 'Scientists discover breakthrough', description: 'A new study shows...', providerName: 'example.com', type: 'link', image: null },
  { url: 'https://example.com/article-2', title: 'New open source project launches', description: 'The project aims to...', providerName: 'example.com', type: 'link', image: null },
];

export const mockConversations = [
  // 1:1 with Alex
  {
    id: 'conv-1',
    accounts: [mockAccount2],
    unread: true,
    lastStatus: makeStatus('200', 'Hey, have you seen the latest update?', mockAccount2),
  },
  // Group chat that also includes Alex — should NOT be opened when clicking "Message" on Alex's profile
  {
    id: 'conv-group',
    accounts: [mockAccount2, mockRemoteAccount],
    unread: false,
    lastStatus: makeStatus('201', 'Let\'s sync on the release plan', mockRemoteAccount),
  },
];

export const mockMarkers = {
  notifications: {
    lastReadId: 'notif-2',
    version: 1,
    updatedAt: now,
    last_read_id: 'notif-2',
  },
};

export const mockSuggestions = [
  { source: 'staff', account: mockAccount2 },
];

export const mockInstance = {
  uri: 'mock.social',
  title: 'Mock Social',
  description: 'A mock Mastodon instance for testing',
  version: '4.2.0',
  urls: { streaming: 'wss://mock.social' },
  configuration: {
    statuses: { maxCharacters: 500, maxMediaAttachments: 4 },
    mediaAttachments: { supportedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'], imageSizeLimit: 10_000_000 },
  },
};

export const mockRelationship = {
  id: '2',
  following: false,
  followedBy: false,
  blocking: false,
  blockedBy: false,
  muting: false,
  mutingNotifications: false,
  requested: false,
  requestedBy: false,
  domainBlocking: false,
  endorsed: false,
  notifying: false,
  note: '',
};

export const mockCredentials = {
  ...mockAccount,
  source: {
    privacy: 'public',
    sensitive: false,
    language: 'en',
    note: 'Mock user for E2E testing',
    fields: [],
  },
};
