import type { FediwayStatus, MediaAttachment, PreviewCard, Status, Tag } from '@repo/types';
import { emilyAccount, janeAccount, marcusAccount, sarahAccount } from './accounts';

let tagIdCounter = 1;

function createTag(name: string): Tag {
  const cleanName = name.replace('#', '');
  return {
    id: String(tagIdCounter++),
    name: cleanName,
    url: `/tags/${cleanName}`,
  };
}

function createImageAttachment(id: string, seed: string): MediaAttachment {
  return {
    id,
    type: 'image',
    url: `https://picsum.photos/seed/${seed}/600/450`,
    previewUrl: `https://picsum.photos/seed/${seed}/300/225`,
    meta: {
      original: {
        width: 600,
        height: 450,
        size: '600x450',
        aspect: 600 / 450,
      },
      small: {
        width: 300,
        height: 225,
        size: '300x225',
        aspect: 300 / 225,
      },
    },
  };
}

function createStatus(
  id: string,
  account: Account,
  content: string,
  tags: string[],
  mediaAttachment: MediaAttachment | null,
  createdAt: string,
  stats: { replies: number; reblogs: number; favourites: number },
): Status {
  const domain = account.acct.split('@')[1] || 'social.network';
  return {
    id,
    uri: `https://${domain}/statuses/${id}`,
    createdAt,
    editedAt: null,
    account,
    content: `<p>${content}</p>`,
    visibility: 'public',
    sensitive: false,
    spoilerText: '',
    mediaAttachments: mediaAttachment ? [mediaAttachment] : [],
    application: { name: 'Web' },
    mentions: [],
    tags: tags.map(createTag),
    emojis: [],
    reblogsCount: stats.reblogs,
    favouritesCount: stats.favourites,
    repliesCount: stats.replies,
    quotesCount: 0,
    quoteApproval: {
      automatic: ['public'],
      manual: [],
      currentUser: 'automatic',
    },
    url: `https://${domain}/@${account.username}/${id}`,
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
  };
}

function createReplyStatus(
  id: string,
  parentId: string,
  parentAccountId: string,
  account: Account,
  content: string,
  createdAt: string,
  stats: { replies: number; reblogs: number; favourites: number },
): Status {
  const status = createStatus(id, account, content, [], null, createdAt, stats);
  return {
    ...status,
    inReplyToId: parentId,
    inReplyToAccountId: parentAccountId,
  };
}

function createPreviewCard(
  url: string,
  title: string,
  description: string,
  image: string | null,
  type: 'link' | 'video' | 'photo' | 'rich' = 'link',
): PreviewCard {
  return {
    url,
    title,
    description,
    type,
    authorName: '',
    authorUrl: '',
    providerName: new URL(url).hostname.replace('www.', ''),
    providerUrl: new URL(url).origin,
    html: '',
    width: 0,
    height: 0,
    image,
    embedUrl: '',
  } as PreviewCard;
}

function createStatusWithCard(
  id: string,
  account: Account,
  content: string,
  tags: string[],
  card: PreviewCard,
  createdAt: string,
  stats: { replies: number; reblogs: number; favourites: number },
): Status {
  const status = createStatus(id, account, content, tags, null, createdAt, stats);
  return { ...status, card };
}

function createStatusWithMedia(
  id: string,
  account: Account,
  content: string,
  tags: string[],
  mediaAttachments: MediaAttachment[],
  createdAt: string,
  stats: { replies: number; reblogs: number; favourites: number },
): Status {
  const domain = account.acct.split('@')[1] || 'social.network';
  return {
    id,
    uri: `https://${domain}/statuses/${id}`,
    createdAt,
    editedAt: null,
    account,
    content: `<p>${content}</p>`,
    visibility: 'public',
    sensitive: false,
    spoilerText: '',
    mediaAttachments,
    application: { name: 'Web' },
    mentions: [],
    tags: tags.map(createTag),
    emojis: [],
    reblogsCount: stats.reblogs,
    favouritesCount: stats.favourites,
    repliesCount: stats.replies,
    quotesCount: 0,
    quoteApproval: {
      automatic: ['public'],
      manual: [],
      currentUser: 'automatic',
    },
    url: `https://${domain}/@${account.username}/${id}`,
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
    filtered: [],
    quote: null,
  };
}

function createStatusWithQuote(
  id: string,
  account: Account,
  content: string,
  tags: string[],
  quotedStatus: Status,
  createdAt: string,
  stats: { replies: number; reblogs: number; favourites: number },
): Status {
  const status = createStatus(id, account, content, tags, null, createdAt, stats);
  return {
    ...status,
    quote: {
      state: 'accepted',
      quotedStatus,
    },
  } as Status;
}

// Use type alias for Account from imports (re-export from @repo/types)
type Account = import('@repo/types').Account;

// --- Main timeline ---

export const mockStatuses: Status[] = [
  // Status with 6 images - carousel mode
  createStatusWithMedia(
    '11',
    sarahAccount,
    'My photography collection from the trip to Japan! Swipe through to see all the amazing places we visited. From temples to cherry blossoms, every moment was magical.',
    ['japan', 'travel', 'photography', 'vacation'],
    [
      createImageAttachment('11-1', 'japan-temple'),
      createImageAttachment('11-2', 'japan-cherry'),
      createImageAttachment('11-3', 'japan-city'),
      createImageAttachment('11-4', 'japan-food'),
      createImageAttachment('11-5', 'japan-nature'),
      createImageAttachment('11-6', 'japan-street'),
    ],
    new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    { replies: 156, reblogs: 89, favourites: 1247 },
  ),
  // Status with 2 images - grid mode
  createStatusWithMedia(
    '12',
    emilyAccount,
    'Before and after of my workspace makeover! Finally got around to organizing everything. What do you think?',
    ['workspace', 'productivity', 'organization'],
    [
      createImageAttachment('12-1', 'workspace-before'),
      createImageAttachment('12-2', 'workspace-after'),
    ],
    new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    { replies: 42, reblogs: 18, favourites: 284 },
  ),
  // Status with 3 images - grid mode
  createStatusWithMedia(
    '13',
    marcusAccount,
    'Weekend brunch was absolutely amazing! Tried three different dishes and couldn\'t pick a favorite. The avocado toast, pancakes, and eggs benedict were all incredible.',
    ['brunch', 'foodie', 'weekend'],
    [
      createImageAttachment('13-1', 'brunch-toast'),
      createImageAttachment('13-2', 'brunch-pancakes'),
      createImageAttachment('13-3', 'brunch-eggs'),
    ],
    new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    { replies: 28, reblogs: 5, favourites: 167 },
  ),
  // Status with 4 images - grid mode
  createStatusWithMedia(
    '14',
    janeAccount,
    'Design inspiration from my recent visit to the modern art museum. Every corner had something beautiful to capture!',
    ['design', 'art', 'museum', 'inspiration'],
    [
      createImageAttachment('14-1', 'museum-art1'),
      createImageAttachment('14-2', 'museum-art2'),
      createImageAttachment('14-3', 'museum-art3'),
      createImageAttachment('14-4', 'museum-art4'),
    ],
    new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    { replies: 67, reblogs: 34, favourites: 445 },
  ),
  createStatus(
    '1',
    sarahAccount,
    'Just finished a beautiful hike through the mountains. The view from the top was absolutely breathtaking!',
    ['hiking', 'nature', 'mountains', 'adventure'],
    createImageAttachment('1', 'post1'),
    new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    { replies: 23, reblogs: 8, favourites: 142 },
  ),
  createStatusWithCard(
    '9',
    emilyAccount,
    'This article on modern CSS is a must-read for every frontend developer. The section on container queries changed how I think about responsive design.',
    ['css', 'webdev', 'frontend'],
    createPreviewCard(
      'https://web.dev/blog/css-wrapped-2024',
      'CSS Wrapped: 2024',
      'A look back at the most exciting CSS features that landed in browsers in 2024, including container queries, :has(), and the new color spaces.',
      'https://picsum.photos/seed/css-article/800/420',
      'link',
    ),
    new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    { replies: 34, reblogs: 89, favourites: 267 },
  ),
  createStatus(
    '2',
    marcusAccount,
    'Working on a new project today. Sometimes the best ideas come when you least expect them.',
    ['coding', 'productivity'],
    createImageAttachment('2', 'post2'),
    new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    { replies: 12, reblogs: 3, favourites: 89 },
  ),
  createStatusWithQuote(
    '10',
    sarahAccount,
    'This is so true! I find my best work happens in the morning with a good cup of coffee. What\'s everyone\'s favorite coffee for coding sessions?',
    ['coffee', 'productivity'],
    createStatus(
      'quoted-3',
      emilyAccount,
      'Coffee and code - the perfect combination for a productive morning. What keeps you going?',
      ['coffee', 'developer', 'morningroutine'],
      createImageAttachment('quoted-3', 'post3'),
      new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      { replies: 45, reblogs: 15, favourites: 256 },
    ),
    new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    { replies: 18, reblogs: 7, favourites: 94 },
  ),
  createStatus(
    '3',
    emilyAccount,
    'Coffee and code - the perfect combination for a productive morning. What keeps you going?',
    ['coffee', 'developer', 'morningroutine'],
    createImageAttachment('3', 'post3'),
    new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    { replies: 45, reblogs: 15, favourites: 256 },
  ),
  // Fediway: book review (4 stars)
  {
    ...createStatus(
      'fw-book-1',
      sarahAccount,
      'I just read "Dune" by Frank Herbert. An absolute masterpiece of world-building. The political intrigue and ecological themes are more relevant than ever.',
      ['books', 'scifi', 'reading'],
      null,
      new Date(Date.now() - 6.5 * 60 * 60 * 1000).toISOString(),
      { replies: 12, reblogs: 5, favourites: 89 },
    ),
    item: {
      url: 'https://openlibrary.org/works/OL893415W',
      type: 'book',
      title: 'Dune',
      description: 'Set on the desert planet Arrakis, Dune is the story of Paul Atreides, who would become the mysterious man known as Muad\'Dib.',
      image: 'https://picsum.photos/seed/dune-cover/300/450',
      author: 'Frank Herbert',
      year: 1965,
      genre: 'Science Fiction',
    },
    rating: { value: 4 },
  } as FediwayStatus,
  createStatus(
    '4',
    sarahAccount,
    'Tried a new recipe today and it turned out amazing! Sharing is caring - recipe in the comments.',
    ['cooking', 'foodie', 'homemade', 'recipe'],
    createImageAttachment('4', 'post4'),
    new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    { replies: 67, reblogs: 24, favourites: 312 },
  ),
  // Fediway: movie review (5 stars)
  {
    ...createStatus(
      'fw-movie-1',
      marcusAccount,
      'I just watched "Everything Everywhere All at Once". This film is a genre-defying masterpiece. Laughed, cried, and questioned reality — all in one sitting.',
      ['movies', 'film', 'scifi'],
      null,
      new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      { replies: 34, reblogs: 18, favourites: 267 },
    ),
    item: {
      url: 'https://www.imdb.com/title/tt6710474',
      type: 'movie',
      title: 'Everything Everywhere All at Once',
      description: 'A middle-aged Chinese immigrant is swept up in an insane adventure where she alone can save existence.',
      image: 'https://picsum.photos/seed/eeaao-poster/300/450',
      director: 'Daniel Kwan, Daniel Scheinert',
      year: 2022,
      genre: 'Action, Adventure, Comedy',
    },
    rating: { value: 5 },
  } as FediwayStatus,
  createStatus(
    '5',
    marcusAccount,
    'Reading a fascinating book about design systems. Every developer should understand good design principles.',
    ['design', 'ux', 'reading'],
    createImageAttachment('5', 'post5'),
    new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    { replies: 31, reblogs: 11, favourites: 178 },
  ),
  // Fediway: song share (3 stars)
  {
    ...createStatus(
      'fw-song-1',
      emilyAccount,
      'I just listened to "Running Up That Hill" by Kate Bush. Stranger Things brought this back and I\'m not mad about it. Timeless synth-pop perfection.',
      ['music', 'synthpop', 'katebush'],
      null,
      new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
      { replies: 8, reblogs: 3, favourites: 56 },
    ),
    item: {
      url: 'https://open.spotify.com/track/75FEaRjZTKLhTrFGsfMUXR',
      type: 'song',
      title: 'Running Up That Hill (A Deal with God)',
      description: 'From the album "Hounds of Love"',
      image: 'https://picsum.photos/seed/kate-bush-album/300/300',
      artist: 'Kate Bush',
      album: 'Hounds of Love',
      year: 1985,
      genre: 'Synth-pop',
    },
    rating: { value: 3 },
  } as FediwayStatus,
  createStatus(
    '6',
    emilyAccount,
    'Sunset at the beach. Sometimes you need to step away from the screen and enjoy nature.',
    ['sunset', 'beach', 'photography', 'peaceful'],
    createImageAttachment('6', 'post6'),
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    { replies: 52, reblogs: 38, favourites: 423 },
  ),
  // Fediway: link rating (4 stars)
  {
    ...createStatusWithCard(
      'fw-link-1',
      janeAccount,
      'I just read this deep-dive on the future of design systems. Incredible resource for anyone building component libraries.',
      ['design', 'designsystems', 'webdev'],
      createPreviewCard(
        'https://designsystems.com/future-of-design-systems',
        'The Future of Design Systems',
        'A comprehensive look at where design systems are heading: AI-assisted theming, cross-platform tokens, and runtime adaptability.',
        'https://picsum.photos/seed/design-systems-article/800/420',
        'link',
      ),
      new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      { replies: 22, reblogs: 15, favourites: 134 },
    ),
    item: {
      url: 'https://designsystems.com/future-of-design-systems',
      type: 'link',
      title: 'The Future of Design Systems',
      description: 'A comprehensive look at where design systems are heading.',
      image: 'https://picsum.photos/seed/design-systems-article/800/420',
    },
    rating: { value: 4 },
  } as FediwayStatus,
  createStatus(
    '7',
    marcusAccount,
    'Just launched my first open source project! Check it out and let me know what you think.',
    ['opensource', 'github', 'programming'],
    createImageAttachment('7', 'post7'),
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    { replies: 89, reblogs: 45, favourites: 567 },
  ),
  createStatus(
    '8',
    sarahAccount,
    'Attended an amazing tech meetup today. The community here is so supportive and inspiring!',
    ['tech', 'meetup', 'community', 'networking'],
    createImageAttachment('8', 'post8'),
    new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    { replies: 28, reblogs: 12, favourites: 234 },
  ),
];

// Set up reply relationship for status '1'
const status1 = mockStatuses.find(s => s.id === '1');
if (status1) {
  status1.inReplyToId = 'parent-1';
  status1.inReplyToAccountId = marcusAccount.id;
}

// --- Thread contexts ---

export const mockContexts: Record<string, { ancestors: Status[]; descendants: Status[] }> = {
  1: {
    ancestors: [
      createStatus(
        'parent-1',
        marcusAccount,
        'Anyone else planning to go hiking this weekend? The weather looks perfect!',
        ['hiking', 'weekend'],
        null,
        new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        { replies: 5, reblogs: 2, favourites: 34 },
      ),
    ],
    descendants: [
      createReplyStatus(
        'reply-1',
        '1',
        sarahAccount.id,
        emilyAccount,
        'Wow, that looks absolutely stunning! Which trail did you take?',
        new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        { replies: 2, reblogs: 0, favourites: 12 },
      ),
      createReplyStatus(
        'reply-1-1',
        'reply-1',
        emilyAccount.id,
        sarahAccount,
        'Thanks Emily! It was the Crystal Lake trail - about 8 miles round trip. Highly recommend it!',
        new Date(Date.now() - 1.25 * 60 * 60 * 1000).toISOString(),
        { replies: 1, reblogs: 0, favourites: 8 },
      ),
      createReplyStatus(
        'reply-1-1-1',
        'reply-1-1',
        sarahAccount.id,
        emilyAccount,
        'Adding it to my list! Do you need any special gear for it?',
        new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        { replies: 0, reblogs: 0, favourites: 3 },
      ),
      createReplyStatus(
        'reply-2',
        '1',
        sarahAccount.id,
        marcusAccount,
        'This is exactly why I asked about hiking plans! Great shot Sarah!',
        new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        { replies: 0, reblogs: 0, favourites: 15 },
      ),
      createReplyStatus(
        'reply-3',
        '1',
        sarahAccount.id,
        emilyAccount,
        'The colors in this photo are incredible. What camera are you using these days?',
        new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        { replies: 1, reblogs: 0, favourites: 7 },
      ),
      createReplyStatus(
        'reply-3-1',
        'reply-3',
        emilyAccount.id,
        sarahAccount,
        'I just got the new Sony A7 IV - it handles landscape shots beautifully!',
        new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        { replies: 0, reblogs: 0, favourites: 4 },
      ),
    ],
  },
  3: {
    ancestors: [],
    descendants: [
      createReplyStatus(
        'coffee-reply-1',
        '3',
        emilyAccount.id,
        sarahAccount,
        'Coffee is definitely my fuel too! What are you working on today?',
        new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        { replies: 1, reblogs: 0, favourites: 18 },
      ),
      createReplyStatus(
        'coffee-reply-1-1',
        'coffee-reply-1',
        sarahAccount.id,
        emilyAccount,
        'Building a new feature for our photo sharing app. Lots of UI work!',
        new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
        { replies: 0, reblogs: 0, favourites: 9 },
      ),
      createReplyStatus(
        'coffee-reply-2',
        '3',
        emilyAccount.id,
        marcusAccount,
        'Tea for me, but I respect the coffee devotion! What blend do you prefer?',
        new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
        { replies: 0, reblogs: 0, favourites: 11 },
      ),
    ],
  },
};

// --- Per-account statuses ---

export const mockAccountStatuses: Record<string, Status[]> = {
  'jane@social.network': [
    createStatus(
      'jane-1',
      janeAccount,
      'Finally finished redesigning the dashboard. Clean, minimal, and user-friendly. What do you think?',
      ['design', 'ux', 'productdesign'],
      createImageAttachment('jane-1', 'jane-post1'),
      new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      { replies: 34, reblogs: 12, favourites: 189 },
    ),
    createStatus(
      'jane-2',
      janeAccount,
      'Morning coffee and Figma. Name a more iconic duo. Working on some exciting new features today!',
      ['design', 'figma', 'coffee'],
      createImageAttachment('jane-2', 'jane-post2'),
      new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
      { replies: 23, reblogs: 8, favourites: 156 },
    ),
    createStatus(
      'jane-3',
      janeAccount,
      'Hot take: Dark mode should be the default for every app. Fight me.',
      ['design', 'darkmode', 'ux'],
      null,
      new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      { replies: 89, reblogs: 45, favourites: 412 },
    ),
    createStatus(
      'jane-4',
      janeAccount,
      'Just discovered this amazing design system library. Sharing with the community because it deserves more attention.',
      ['design', 'opensource', 'designsystems'],
      createImageAttachment('jane-4', 'jane-post4'),
      new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
      { replies: 56, reblogs: 34, favourites: 267 },
    ),
  ],
  'sarah@social.network': [
    createStatus(
      'sarah-1',
      sarahAccount,
      'Just finished a beautiful hike through the mountains. The view from the top was absolutely breathtaking!',
      ['hiking', 'nature', 'mountains', 'adventure'],
      createImageAttachment('sarah-1', 'sarah-post1'),
      new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      { replies: 23, reblogs: 8, favourites: 142 },
    ),
    createStatus(
      'sarah-2',
      sarahAccount,
      'Golden hour at the beach. Sometimes the best photos happen when you least expect them.',
      ['photography', 'goldenhour', 'beach'],
      createImageAttachment('sarah-2', 'sarah-post2'),
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      { replies: 45, reblogs: 19, favourites: 287 },
    ),
    createStatus(
      'sarah-3',
      sarahAccount,
      'New camera arrived today! Can\'t wait to test it out this weekend.',
      ['photography', 'newgear'],
      createImageAttachment('sarah-3', 'sarah-post3'),
      new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      { replies: 32, reblogs: 5, favourites: 198 },
    ),
  ],
  'marcus.j@federated.social': [
    createStatus(
      'marcus-1',
      marcusAccount,
      'Working on a new project today. Sometimes the best ideas come when you least expect them.',
      ['coding', 'productivity'],
      createImageAttachment('marcus-1', 'marcus-post1'),
      new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      { replies: 12, reblogs: 3, favourites: 89 },
    ),
    createStatus(
      'marcus-2',
      marcusAccount,
      'Late night jam session with the band. Nothing beats making music with friends.',
      ['music', 'jamming', 'livemusic'],
      createImageAttachment('marcus-2', 'marcus-post2'),
      new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      { replies: 28, reblogs: 11, favourites: 156 },
    ),
    createStatus(
      'marcus-3',
      marcusAccount,
      'Finally shipped that feature I\'ve been working on for weeks. Feels good!',
      ['webdev', 'shipped'],
      createImageAttachment('marcus-3', 'marcus-post3'),
      new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
      { replies: 41, reblogs: 15, favourites: 234 },
    ),
  ],
  'emily_r@mastodon.social': [
    createStatus(
      'emily-1',
      emilyAccount,
      'Coffee and code - the perfect combination for a productive morning. What keeps you going?',
      ['coffee', 'developer', 'morningroutine'],
      createImageAttachment('emily-1', 'emily-post1'),
      new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      { replies: 45, reblogs: 15, favourites: 256 },
    ),
    createStatus(
      'emily-2',
      emilyAccount,
      'Just discovered this amazing little cafe with the best espresso in town. Highly recommend!',
      ['coffee', 'cafe', 'espresso'],
      createImageAttachment('emily-2', 'emily-post2'),
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      { replies: 34, reblogs: 8, favourites: 189 },
    ),
    createStatus(
      'emily-3',
      emilyAccount,
      'Attending a tech conference this week. The energy here is incredible!',
      ['tech', 'conference', 'networking'],
      createImageAttachment('emily-3', 'emily-post3'),
      new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
      { replies: 56, reblogs: 22, favourites: 312 },
    ),
    createStatus(
      'emily-4',
      emilyAccount,
      'Home office setup complete. Ready to crush some code this week!',
      ['homeoffice', 'remotework', 'developer'],
      createImageAttachment('emily-4', 'emily-post4'),
      new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString(),
      { replies: 67, reblogs: 31, favourites: 445 },
    ),
  ],
};

// --- Favourited/Bookmarked ---

export const favouritedStatuses: Status[] = [
  { ...mockStatuses[1]!, favourited: true },
  { ...mockStatuses[3]!, favourited: true },
  { ...mockStatuses[5]!, favourited: true },
  { ...mockStatuses[6]!, favourited: true },
];

export const bookmarkedStatuses: Status[] = [
  { ...mockStatuses[2]!, bookmarked: true },
  { ...mockStatuses[4]!, bookmarked: true },
  { ...mockStatuses[7]!, bookmarked: true },
];

// --- Link statuses ---

export const linkStatuses: Status[] = [
  createStatusWithCard(
    'link-1',
    sarahAccount,
    'This is absolutely groundbreaking! The implications for energy infrastructure are massive.',
    ['science', 'physics'],
    createPreviewCard(
      'https://github.com/articles/superconductor-discovery',
      'Scientists discover high-temperature superconductor at room pressure',
      'A breakthrough in materials science could revolutionize energy transmission and computing technology.',
      'https://picsum.photos/seed/superconductor/800/420',
      'link',
    ),
    new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    { replies: 45, reblogs: 89, favourites: 312 },
  ),
  createStatusWithCard(
    'link-2',
    marcusAccount,
    'Been following this research for months. Finally some real progress!',
    ['science', 'tech'],
    createPreviewCard(
      'https://github.com/articles/superconductor-discovery',
      'Scientists discover high-temperature superconductor at room pressure',
      'A breakthrough in materials science could revolutionize energy transmission and computing technology.',
      'https://picsum.photos/seed/superconductor/800/420',
      'link',
    ),
    new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    { replies: 23, reblogs: 34, favourites: 156 },
  ),
  createStatusWithCard(
    'link-3',
    emilyAccount,
    'The reasoning improvements look impressive. Curious to see benchmarks on code generation tasks.',
    ['ai', 'tech', 'coding'],
    createPreviewCard(
      'https://nytimes.com/openai-gpt5',
      'OpenAI announces GPT-5 with improved reasoning',
      'The latest language model shows significant improvements in mathematical reasoning and code generation.',
      'https://picsum.photos/seed/gpt5/800/420',
      'link',
    ),
    new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    { replies: 67, reblogs: 45, favourites: 234 },
  ),
  createStatusWithCard(
    'link-4',
    sarahAccount,
    'Finally! Privacy regulations that actually have teeth. This is a big win for users.',
    ['privacy', 'eu', 'tech'],
    createPreviewCard(
      'https://bbc.com/eu-privacy-law',
      'EU passes new digital privacy regulations',
      'New laws will require tech companies to provide more transparency about data collection practices.',
      'https://picsum.photos/seed/euprivacy/800/420',
      'link',
    ),
    new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    { replies: 34, reblogs: 56, favourites: 189 },
  ),
  createStatusWithCard(
    'link-5',
    marcusAccount,
    'Watched the whole thing live. What an incredible achievement for SpaceX and humanity!',
    ['space', 'spacex', 'science'],
    createPreviewCard(
      'https://youtube.com/starship-orbital',
      'SpaceX Starship completes orbital flight',
      'The largest rocket ever built successfully completed its first full orbital mission.',
      'https://picsum.photos/seed/starship/800/420',
      'link',
    ),
    new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    { replies: 89, reblogs: 123, favourites: 567 },
  ),
  createStatusWithCard(
    'link-6',
    emilyAccount,
    'My company switched to hybrid last year and productivity has definitely improved.',
    ['remotework', 'productivity'],
    createPreviewCard(
      'https://youtube.com/starship-orbital',
      'SpaceX Starship completes orbital flight',
      'The largest rocket ever built successfully completed its first full orbital mission.',
      'https://picsum.photos/seed/starship/800/420',
      'link',
    ),
    new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    { replies: 23, reblogs: 12, favourites: 98 },
  ),
];

// --- Tagged statuses ---

export const taggedStatuses: Record<string, Status[]> = {
  photography: [
    createStatus(
      'photo-1',
      sarahAccount,
      'Golden hour never disappoints. Caught this stunning sunset at the pier today.',
      ['photography', 'sunset', 'goldenhour'],
      createImageAttachment('photo-1', 'photography1'),
      new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      { replies: 34, reblogs: 21, favourites: 289 },
    ),
    createStatus(
      'photo-2',
      emilyAccount,
      'Street photography in the rain. There\'s something magical about city lights reflecting on wet pavement.',
      ['photography', 'streetphotography', 'urban'],
      createImageAttachment('photo-2', 'photography2'),
      new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      { replies: 28, reblogs: 15, favourites: 198 },
    ),
    createStatus(
      'photo-3',
      marcusAccount,
      'Finally upgraded my camera gear. The difference in low-light performance is incredible!',
      ['photography', 'cameragear', 'tech'],
      createImageAttachment('photo-3', 'photography3'),
      new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      { replies: 45, reblogs: 8, favourites: 156 },
    ),
  ],
  nature: [
    createStatus(
      'nature-1',
      sarahAccount,
      'Found this hidden waterfall during my morning hike. Nature always finds a way to surprise you.',
      ['nature', 'hiking', 'waterfall', 'outdoors'],
      createImageAttachment('nature-1', 'nature1'),
      new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      { replies: 56, reblogs: 34, favourites: 412 },
    ),
    createStatus(
      'nature-2',
      emilyAccount,
      'Morning mist over the lake. These quiet moments are why I wake up early.',
      ['nature', 'peaceful', 'morning'],
      createImageAttachment('nature-2', 'nature2'),
      new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      { replies: 23, reblogs: 19, favourites: 267 },
    ),
    createStatus(
      'nature-3',
      marcusAccount,
      'Wildlife spotting in the national park. Patience really pays off!',
      ['nature', 'wildlife', 'photography'],
      createImageAttachment('nature-3', 'nature3'),
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      { replies: 67, reblogs: 45, favourites: 534 },
    ),
  ],
  coding: [
    createStatus(
      'coding-1',
      marcusAccount,
      'Just refactored 2000 lines of legacy code into 200 lines of clean, modern TypeScript. Feels amazing!',
      ['coding', 'typescript', 'refactoring', 'cleancode'],
      null,
      new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      { replies: 89, reblogs: 45, favourites: 567 },
    ),
    createStatus(
      'coding-2',
      emilyAccount,
      'Hot take: Writing tests first actually saves time in the long run. TDD converts, where you at?',
      ['coding', 'tdd', 'testing', 'webdev'],
      null,
      new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      { replies: 156, reblogs: 67, favourites: 423 },
    ),
    createStatus(
      'coding-3',
      sarahAccount,
      'Learning Rust this weekend. The borrow checker is challenging but I\'m starting to see why people love it.',
      ['coding', 'rust', 'learning'],
      createImageAttachment('coding-3', 'coding3'),
      new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      { replies: 78, reblogs: 23, favourites: 345 },
    ),
  ],
  travel: [
    createStatus(
      'travel-1',
      sarahAccount,
      'Just landed in Tokyo! The energy here is incredible. Ready for an amazing week of exploration.',
      ['travel', 'tokyo', 'japan', 'adventure'],
      createImageAttachment('travel-1', 'travel1'),
      new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      { replies: 45, reblogs: 28, favourites: 389 },
    ),
    createStatus(
      'travel-2',
      marcusAccount,
      'Road trip through the countryside. Sometimes the journey is better than the destination.',
      ['travel', 'roadtrip', 'adventure'],
      createImageAttachment('travel-2', 'travel2'),
      new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      { replies: 34, reblogs: 21, favourites: 267 },
    ),
    createStatus(
      'travel-3',
      emilyAccount,
      'Hidden gem alert! This little cafe in Lisbon has the best pasteis de nata I\'ve ever tasted.',
      ['travel', 'lisbon', 'foodie', 'portugal'],
      createImageAttachment('travel-3', 'travel3'),
      new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      { replies: 56, reblogs: 34, favourites: 445 },
    ),
  ],
  foodie: [
    createStatus(
      'foodie-1',
      sarahAccount,
      'Homemade ramen from scratch. 12 hours of simmering but worth every minute!',
      ['foodie', 'ramen', 'homemade', 'cooking'],
      createImageAttachment('foodie-1', 'foodie1'),
      new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      { replies: 78, reblogs: 45, favourites: 534 },
    ),
    createStatus(
      'foodie-2',
      emilyAccount,
      'Sunday brunch done right. Avocado toast with poached eggs and a perfectly crafted latte.',
      ['foodie', 'brunch', 'coffee', 'weekend'],
      createImageAttachment('foodie-2', 'foodie2'),
      new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
      { replies: 34, reblogs: 15, favourites: 289 },
    ),
    createStatus(
      'foodie-3',
      marcusAccount,
      'Tried making sourdough for the first time. Not perfect but I\'m proud of this loaf!',
      ['foodie', 'sourdough', 'baking', 'homemade'],
      createImageAttachment('foodie-3', 'foodie3'),
      new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      { replies: 89, reblogs: 28, favourites: 412 },
    ),
  ],
  music: [
    createStatus(
      'music-1',
      marcusAccount,
      'New track dropping next week! Been working on this one for months. Electronic meets jazz fusion.',
      ['music', 'producer', 'newmusic', 'jazz'],
      createImageAttachment('music-1', 'music1'),
      new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      { replies: 67, reblogs: 45, favourites: 389 },
    ),
    createStatus(
      'music-2',
      sarahAccount,
      'Vinyl collection growing! Just picked up a rare pressing of Kind of Blue.',
      ['music', 'vinyl', 'jazz', 'collection'],
      createImageAttachment('music-2', 'music2'),
      new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
      { replies: 45, reblogs: 21, favourites: 267 },
    ),
    createStatus(
      'music-3',
      emilyAccount,
      'Live music night! Nothing beats seeing your favorite band perform in an intimate venue.',
      ['music', 'livemusic', 'concert', 'nightlife'],
      createImageAttachment('music-3', 'music3'),
      new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
      { replies: 34, reblogs: 18, favourites: 198 },
    ),
  ],
  fitness: [
    createStatus(
      'fitness-1',
      marcusAccount,
      'New PR on deadlifts today! Consistency really is the key to progress.',
      ['fitness', 'gym', 'strength', 'progress'],
      createImageAttachment('fitness-1', 'fitness1'),
      new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      { replies: 56, reblogs: 23, favourites: 312 },
    ),
    createStatus(
      'fitness-2',
      sarahAccount,
      'Morning yoga by the beach. Best way to start the day, hands down.',
      ['fitness', 'yoga', 'morning', 'wellness'],
      createImageAttachment('fitness-2', 'fitness2'),
      new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      { replies: 45, reblogs: 28, favourites: 378 },
    ),
    createStatus(
      'fitness-3',
      emilyAccount,
      'Completed my first marathon! 26.2 miles of pure determination. Still can\'t believe I did it.',
      ['fitness', 'marathon', 'running', 'achievement'],
      createImageAttachment('fitness-3', 'fitness3'),
      new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      { replies: 234, reblogs: 89, favourites: 1245 },
    ),
  ],
};
