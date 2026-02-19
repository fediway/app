import type { FediwayStatus } from '@repo/types';
import { emilyAccount, janeAccount, marcusAccount, sarahAccount } from './accounts';

const baseStatus = {
  uri: '',
  editedAt: null,
  visibility: 'public' as const,
  sensitive: false,
  spoilerText: '',
  mediaAttachments: [],
  application: { name: 'Fediway', website: null },
  mentions: [],
  tags: [],
  emojis: [],
  reblogsCount: 0,
  favouritesCount: 0,
  repliesCount: 0,
  quote: null,
  quotesCount: 0,
  quoteApproval: { automatic: [], manual: ['public' as const], currentUser: 'automatic' as const },
  reblog: null,
  poll: null,
  card: null,
  language: 'en',
  favourited: false,
  reblogged: false,
  muted: false,
  bookmarked: false,
  pinned: false,
} satisfies Partial<FediwayStatus>;

// Plain text posts
export const plainTextStatus1: FediwayStatus = {
  ...baseStatus,
  id: 's1',
  createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  account: janeAccount,
  content: '<p>Just spent 3 hours reorganizing my bookshelf by color instead of doing actual work. No regrets.</p>',
  favouritesCount: 12,
  reblogsCount: 3,
  repliesCount: 2,
};

export const plainTextStatus2: FediwayStatus = {
  ...baseStatus,
  id: 's2',
  createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  account: marcusAccount,
  content: '<p>Hot take: the best movie soundtrack of all time is still the Interstellar OST. Hans Zimmer understood the assignment.</p>',
  favouritesCount: 89,
  reblogsCount: 24,
  repliesCount: 31,
};

// Single image post
export const imageStatus: FediwayStatus = {
  ...baseStatus,
  id: 's3',
  createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  account: emilyAccount,
  content: '<p>Golden hour at the park today</p>',
  mediaAttachments: [
    {
      id: 'ma1',
      type: 'image',
      url: 'https://picsum.photos/seed/park/800/600',
      previewUrl: 'https://picsum.photos/seed/park/400/300',
      description: 'Golden hour sunlight through trees in a park',
      blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
    },
  ],
  favouritesCount: 45,
  reblogsCount: 8,
};

// Multi-image post (4 images)
export const multiImageStatus: FediwayStatus = {
  ...baseStatus,
  id: 's4',
  createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  account: janeAccount,
  content: '<p>Weekend market finds</p>',
  mediaAttachments: [
    {
      id: 'ma2',
      type: 'image',
      url: 'https://picsum.photos/seed/market1/800/600',
      previewUrl: 'https://picsum.photos/seed/market1/400/300',
      description: 'Fresh produce at a farmers market',
    },
    {
      id: 'ma3',
      type: 'image',
      url: 'https://picsum.photos/seed/market2/600/800',
      previewUrl: 'https://picsum.photos/seed/market2/300/400',
      description: 'Handmade ceramics on display',
    },
    {
      id: 'ma4',
      type: 'image',
      url: 'https://picsum.photos/seed/market3/800/800',
      previewUrl: 'https://picsum.photos/seed/market3/400/400',
      description: 'Bouquet of wildflowers',
    },
    {
      id: 'ma5',
      type: 'image',
      url: 'https://picsum.photos/seed/market4/800/600',
      previewUrl: 'https://picsum.photos/seed/market4/400/300',
      description: 'Artisan bread loaves',
    },
  ],
  favouritesCount: 67,
  reblogsCount: 12,
};

// Book review (4 stars)
export const bookReviewStatus: FediwayStatus = {
  ...baseStatus,
  id: 's5',
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  account: sarahAccount,
  content: '<p>I just read Dune by Frank Herbert. The world-building is absolutely unmatched. Took a bit to get into the political intrigue but once it clicks, it really clicks.</p>',
  favouritesCount: 34,
  reblogsCount: 11,
  repliesCount: 7,
  item: {
    url: 'https://openlibrary.org/works/OL893415W',
    type: 'book',
    title: 'Dune',
    description: 'Set on the desert planet Arrakis, Dune is the story of Paul Atreides.',
    image: 'https://covers.openlibrary.org/b/id/14726766-L.jpg',
    author: 'Frank Herbert',
    year: 1965,
    genre: 'Science Fiction',
  },
  rating: { value: 4 },
};

// Movie review (5 stars)
export const movieReviewStatus: FediwayStatus = {
  ...baseStatus,
  id: 's6',
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  account: marcusAccount,
  content: '<p>I just watched Everything Everywhere All at Once. This is what cinema should be. Laughed, cried, questioned reality. The bagel universe scene alone is worth the ticket.</p>',
  favouritesCount: 156,
  reblogsCount: 52,
  repliesCount: 23,
  item: {
    url: 'https://www.imdb.com/title/tt6710474/',
    type: 'movie',
    title: 'Everything Everywhere All at Once',
    description: 'A middle-aged Chinese immigrant is swept up in an insane adventure.',
    image: 'https://picsum.photos/seed/eeaao/300/450',
    director: 'Daniel Kwan, Daniel Scheinert',
    year: 2022,
    genre: 'Sci-Fi / Comedy',
  },
  rating: { value: 5 },
};

// Song share (3 stars)
export const songShareStatus: FediwayStatus = {
  ...baseStatus,
  id: 's7',
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  account: emilyAccount,
  content: '<p>I just listened to Motion Sickness by Phoebe Bridgers. It\'s good but I don\'t get the hype everyone gives it. Solid songwriting though.</p>',
  favouritesCount: 18,
  reblogsCount: 4,
  repliesCount: 9,
  item: {
    url: 'https://open.spotify.com/track/2AWjRFMRCruXXBpnDGkiEg',
    type: 'song',
    title: 'Motion Sickness',
    artist: 'Phoebe Bridgers',
    album: 'Stranger in the Alps',
    year: 2017,
    genre: 'Indie Folk',
  },
  rating: { value: 3 },
};

// Link rating (4 stars)
export const linkRatingStatus: FediwayStatus = {
  ...baseStatus,
  id: 's8',
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  account: janeAccount,
  content: '<p>I just found this incredible deep dive on design systems. If you build UI components, this is a must-read.</p>',
  favouritesCount: 92,
  reblogsCount: 38,
  repliesCount: 5,
  item: {
    url: 'https://bradfrost.com/blog/post/atomic-web-design/',
    type: 'link',
    title: 'Atomic Web Design',
    description: 'A methodology for creating design systems with five distinct levels.',
    image: 'https://picsum.photos/seed/atomic/800/400',
    author: 'Brad Frost',
  },
  rating: { value: 4 },
};

export const allStatuses: FediwayStatus[] = [
  plainTextStatus1,
  plainTextStatus2,
  imageStatus,
  multiImageStatus,
  bookReviewStatus,
  movieReviewStatus,
  songShareStatus,
  linkRatingStatus,
];
