import type { Account, Context, MediaAttachment, Notification, PreviewCard, Status, Tag } from '@repo/types';
import { usePosts } from './usePosts';

// Counter for generating unique tag IDs
let tagIdCounter = 1;

// Helper to create a tag matching masto's Tag type
function createTag(name: string): Tag {
  const cleanName = name.replace('#', '');
  return {
    id: String(tagIdCounter++),
    name: cleanName,
    url: `/tags/${cleanName}`,
  };
}

// Helper to create a media attachment matching masto's MediaAttachment type
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

// Helper to create an account matching masto's Account type
function createAccount(
  id: string,
  username: string,
  acct: string,
  displayName: string,
  note: string,
  avatarSeed: string,
  headerSeed: string,
  stats: { statuses: number; followers: number; following: number },
  fields: Array<{ name: string; value: string }>,
): Account {
  return {
    id,
    username,
    acct,
    url: `https://${acct.split('@')[1] || 'social.network'}/@${username}`,
    displayName,
    note: `<p>${note}</p>`,
    avatar: `https://picsum.photos/seed/${avatarSeed}/200/200`,
    avatarStatic: `https://picsum.photos/seed/${avatarSeed}/200/200`,
    header: `https://picsum.photos/seed/${headerSeed}/800/300`,
    headerStatic: `https://picsum.photos/seed/${headerSeed}/800/300`,
    locked: false,
    fields,
    emojis: [],
    bot: false,
    group: false,
    createdAt: '2023-01-15T00:00:00.000Z',
    lastStatusAt: new Date().toISOString().split('T')[0] as string,
    statusesCount: stats.statuses,
    followersCount: stats.followers,
    followingCount: stats.following,
    roles: [],
  };
}

// Suggested accounts for follow recommendations
const suggestedAccounts: Account[] = [
  createAccount(
    'sug-1',
    'alex_photo',
    'alex_photo@pixelfed.social',
    'Alex Photography',
    'Landscape & travel photographer. Capturing the beauty of our world one shot at a time.',
    'alex-photo',
    'alex-photo-header',
    { statuses: 892, followers: 15400, following: 234 },
    [{ name: 'Portfolio', value: '<a href="https://alexphoto.com">alexphoto.com</a>' }],
  ),
  createAccount(
    'sug-2',
    'techie_sam',
    'techie_sam@mastodon.social',
    'Sam Chen',
    'Full-stack developer | Open source enthusiast | Building cool stuff',
    'techie-sam',
    'techie-sam-header',
    { statuses: 1245, followers: 8900, following: 567 },
    [{ name: 'GitHub', value: '<a href="https://github.com/techiesam">github.com/techiesam</a>' }],
  ),
  createAccount(
    'sug-3',
    'foodie_lisa',
    'foodie_lisa@social.cooking',
    'Lisa Cooks',
    'Home chef & recipe creator. Sharing delicious meals from around the world.',
    'foodie-lisa',
    'foodie-lisa-header',
    { statuses: 567, followers: 23000, following: 890 },
    [{ name: 'Blog', value: '<a href="https://lisacooks.blog">lisacooks.blog</a>' }],
  ),
  createAccount(
    'sug-4',
    'indie_dev',
    'indie_dev@gamedev.place',
    'Indie Game Dev',
    'Solo game developer making pixel art adventures. Currently working on a new RPG!',
    'indie-dev',
    'indie-dev-header',
    { statuses: 423, followers: 12300, following: 345 },
    [{ name: 'Games', value: '<a href="https://indiedev.itch.io">itch.io</a>' }],
  ),
  createAccount(
    'sug-5',
    'bookworm_mia',
    'bookworm_mia@bookwyrm.social',
    'Mia Reads',
    'Book reviewer & literature lover. Always looking for the next great read.',
    'bookworm-mia',
    'bookworm-mia-header',
    { statuses: 789, followers: 5600, following: 1200 },
    [{ name: 'Goodreads', value: '<a href="https://goodreads.com/miareads">goodreads.com/miareads</a>' }],
  ),
  createAccount(
    'sug-6',
    'fitness_jay',
    'fitness_jay@social.fitness',
    'Jay Fitness',
    'Personal trainer & nutrition coach. Helping you reach your fitness goals!',
    'fitness-jay',
    'fitness-jay-header',
    { statuses: 634, followers: 18700, following: 423 },
    [{ name: 'Website', value: '<a href="https://jayfitness.co">jayfitness.co</a>' }],
  ),
];

const mockAccounts: Record<string, Account> = {
  'jane@social.network': createAccount(
    '0',
    'jane',
    'jane@social.network',
    'Jane Doe',
    'Product designer & coffee addict. Building beautiful things on the fediverse.',
    'jane',
    'jane-header',
    { statuses: 234, followers: 1847, following: 412 },
    [
      { name: 'Website', value: '<a href="https://janedoe.design">janedoe.design</a>' },
      { name: 'Location', value: 'New York, NY' },
    ],
  ),
  'sarah@social.network': createAccount(
    '1',
    'sarah',
    'sarah@social.network',
    'Sarah Chen',
    'Photographer & nature lover. Capturing moments one click at a time. Based in San Francisco.',
    'sarah',
    'sarah-header',
    { statuses: 142, followers: 2400, following: 891 },
    [
      { name: 'Website', value: '<a href="https://sarahchen.photo">sarahchen.photo</a>' },
      { name: 'Location', value: 'San Francisco, CA' },
    ],
  ),
  'marcus.j@federated.social': createAccount(
    '2',
    'marcus.j',
    'marcus.j@federated.social',
    'Marcus Johnson',
    'Software engineer by day, musician by night. Building cool stuff and making noise.',
    'marcus',
    'marcus-header',
    { statuses: 89, followers: 1200, following: 345 },
    [
      { name: 'GitHub', value: '<a href="https://github.com/marcusj">github.com/marcusj</a>' },
    ],
  ),
  'emily_r@mastodon.social': createAccount(
    '3',
    'emily_r',
    'emily_r@mastodon.social',
    'Emily Rodriguez',
    'Coffee enthusiast & full-stack developer. Writing code and drinking espresso since 2015.',
    'emily',
    'emily-header',
    { statuses: 256, followers: 4500, following: 1200 },
    [
      { name: 'Website', value: '<a href="https://emilydev.io">emilydev.io</a>' },
      { name: 'Coffee', value: 'Espresso lover ☕' },
    ],
  ),
};

// Helper to create a status matching masto's Status type
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
    application: {
      name: 'Web',
    },
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

// Helper to create a reply status
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

// Helper to create a preview card
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

// Helper to create a status with a preview card
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
  return {
    ...status,
    card,
  };
}

// Helper to create a status with multiple media attachments
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
    application: {
      name: 'Web',
    },
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

// Helper to create a status with a quote
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

const janeAccount = mockAccounts['jane@social.network']!;
const sarahAccount = mockAccounts['sarah@social.network']!;
const marcusAccount = mockAccounts['marcus.j@federated.social']!;
const emilyAccount = mockAccounts['emily_r@mastodon.social']!;

const mockStatuses: Status[] = [
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
  // Status with 4 images - grid mode (max before carousel)
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
    // Quote Emily's coffee post
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
  createStatus(
    '4',
    sarahAccount,
    'Tried a new recipe today and it turned out amazing! Sharing is caring - recipe in the comments.',
    ['cooking', 'foodie', 'homemade', 'recipe'],
    createImageAttachment('4', 'post4'),
    new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    { replies: 67, reblogs: 24, favourites: 312 },
  ),
  createStatus(
    '5',
    marcusAccount,
    'Reading a fascinating book about design systems. Every developer should understand good design principles.',
    ['design', 'ux', 'reading'],
    createImageAttachment('5', 'post5'),
    new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    { replies: 31, reblogs: 11, favourites: 178 },
  ),
  createStatus(
    '6',
    emilyAccount,
    'Sunset at the beach. Sometimes you need to step away from the screen and enjoy nature.',
    ['sunset', 'beach', 'photography', 'peaceful'],
    createImageAttachment('6', 'post6'),
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    { replies: 52, reblogs: 38, favourites: 423 },
  ),
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

// Mock thread data for status detail pages
// Thread for status '1' (Sarah's hiking post)
const mockThreadContexts: Record<string, { ancestors: Status[]; descendants: Status[] }> = {
  1: {
    ancestors: [
      // Parent post that Sarah was replying to
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
      // Direct replies to Sarah's post
      createReplyStatus(
        'reply-1',
        '1',
        sarahAccount.id,
        emilyAccount,
        'Wow, that looks absolutely stunning! Which trail did you take?',
        new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        { replies: 2, reblogs: 0, favourites: 12 },
      ),
      // Nested reply to reply-1
      createReplyStatus(
        'reply-1-1',
        'reply-1',
        emilyAccount.id,
        sarahAccount,
        'Thanks Emily! It was the Crystal Lake trail - about 8 miles round trip. Highly recommend it!',
        new Date(Date.now() - 1.25 * 60 * 60 * 1000).toISOString(),
        { replies: 1, reblogs: 0, favourites: 8 },
      ),
      // Further nested reply
      createReplyStatus(
        'reply-1-1-1',
        'reply-1-1',
        sarahAccount.id,
        emilyAccount,
        'Adding it to my list! Do you need any special gear for it?',
        new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        { replies: 0, reblogs: 0, favourites: 3 },
      ),
      // Another direct reply to Sarah's post
      createReplyStatus(
        'reply-2',
        '1',
        sarahAccount.id,
        marcusAccount,
        'This is exactly why I asked about hiking plans! Great shot Sarah!',
        new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        { replies: 0, reblogs: 0, favourites: 15 },
      ),
      // Third direct reply
      createReplyStatus(
        'reply-3',
        '1',
        sarahAccount.id,
        emilyAccount,
        'The colors in this photo are incredible. What camera are you using these days?',
        new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        { replies: 1, reblogs: 0, favourites: 7 },
      ),
      // Reply to reply-3
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
  // Thread for status '3' (Emily's coffee post)
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

// Update status '1' to have inReplyToId pointing to parent
const status1WithParent = mockStatuses.find(s => s.id === '1');
if (status1WithParent) {
  status1WithParent.inReplyToId = 'parent-1';
  status1WithParent.inReplyToAccountId = marcusAccount.id;
}

const mockAccountStatuses: Record<string, Status[]> = {
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
      'Just discovered this amazing little café with the best espresso in town. Highly recommend!',
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

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'favourite',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    account: marcusAccount,
    groupKey: 'favourite-1',
    status: mockStatuses[0]!,
  },
  {
    id: 'notif-2',
    type: 'reblog',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    account: emilyAccount,
    groupKey: 'reblog-1',
    status: mockStatuses[0]!,
  },
  {
    id: 'notif-3',
    type: 'follow',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    account: sarahAccount,
    groupKey: 'follow-1',
  },
  {
    id: 'notif-4',
    type: 'mention',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    account: marcusAccount,
    groupKey: 'mention-1',
    status: createStatus(
      'mention-status-1',
      marcusAccount,
      '@you Hey, check out this new library I found! It might be useful for our project.',
      ['coding', 'webdev'],
      null,
      new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      { replies: 2, reblogs: 0, favourites: 5 },
    ),
  },
  {
    id: 'notif-5',
    type: 'favourite',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    account: sarahAccount,
    groupKey: 'favourite-2',
    status: mockStatuses[2]!,
  },
  {
    id: 'notif-6',
    type: 'follow',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    account: emilyAccount,
    groupKey: 'follow-2',
  },
  {
    id: 'notif-7',
    type: 'reblog',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    account: sarahAccount,
    groupKey: 'reblog-2',
    status: mockStatuses[3]!,
  },
  {
    id: 'notif-8',
    type: 'mention',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    account: emilyAccount,
    groupKey: 'mention-2',
    status: createStatus(
      'mention-status-2',
      emilyAccount,
      '@you Thanks for the coffee recommendation! That café is now my new favorite spot.',
      ['coffee'],
      null,
      new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      { replies: 1, reblogs: 0, favourites: 3 },
    ),
  },
];

// Favourited (liked) statuses - subset of timeline with favourited flag
const mockFavouritedStatuses: Status[] = [
  { ...mockStatuses[1]!, favourited: true },
  { ...mockStatuses[3]!, favourited: true },
  { ...mockStatuses[5]!, favourited: true },
  { ...mockStatuses[6]!, favourited: true },
];

// Bookmarked (saved) statuses
const mockBookmarkedStatuses: Status[] = [
  { ...mockStatuses[2]!, bookmarked: true },
  { ...mockStatuses[4]!, bookmarked: true },
  { ...mockStatuses[7]!, bookmarked: true },
];

// Statuses that share trending links
const linkStatuses: Status[] = [
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

// Trending tags for explore page
const trendingTags: Tag[] = [
  { id: 'trend-1', name: 'photography', url: '/tags/photography' },
  { id: 'trend-2', name: 'coding', url: '/tags/coding' },
  { id: 'trend-3', name: 'coffee', url: '/tags/coffee' },
  { id: 'trend-4', name: 'nature', url: '/tags/nature' },
  { id: 'trend-5', name: 'music', url: '/tags/music' },
  { id: 'trend-6', name: 'design', url: '/tags/design' },
  { id: 'trend-7', name: 'webdev', url: '/tags/webdev' },
  { id: 'trend-8', name: 'travel', url: '/tags/travel' },
  { id: 'trend-9', name: 'foodie', url: '/tags/foodie' },
  { id: 'trend-10', name: 'fitness', url: '/tags/fitness' },
];

// Additional tagged statuses for tag feeds
const taggedStatuses: Record<string, Status[]> = {
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
      'Hidden gem alert! This little café in Lisbon has the best pastéis de nata I\'ve ever tasted.',
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

export function useMockData() {
  function getAccountByAcct(acct: string): Account | undefined {
    return mockAccounts[acct];
  }

  function getAccountStatuses(acct: string): Status[] {
    return mockAccountStatuses[acct] || [];
  }

  function getAllAccounts(): Account[] {
    return Object.values(mockAccounts);
  }

  function getSuggestedAccounts(): Account[] {
    return suggestedAccounts;
  }

  function getHomeTimeline(): Status[] {
    const { userPosts } = usePosts();
    return [...userPosts, ...mockStatuses];
  }

  function getStatusById(id: string): Status | undefined {
    // Check user-created posts first
    const { userPosts } = usePosts();
    const userPost = userPosts.find(s => s.id === id);
    if (userPost)
      return userPost;

    // Check main timeline
    const timelineStatus = mockStatuses.find(s => s.id === id);
    if (timelineStatus)
      return timelineStatus;

    // Check thread contexts for ancestors/descendants
    for (const context of Object.values(mockThreadContexts)) {
      const ancestor = context.ancestors.find(s => s.id === id);
      if (ancestor)
        return ancestor;
      const descendant = context.descendants.find(s => s.id === id);
      if (descendant)
        return descendant;
    }

    // Check account-specific statuses
    for (const statuses of Object.values(mockAccountStatuses)) {
      const status = statuses.find(s => s.id === id);
      if (status)
        return status;
    }

    return undefined;
  }

  function getStatusContext(id: string): Context {
    // Return predefined context if it exists
    if (mockThreadContexts[id]) {
      return mockThreadContexts[id];
    }

    // For statuses that are replies themselves, find their parent chain
    const status = getStatusById(id);
    const ancestors: Status[] = [];
    const descendants: Status[] = [];

    if (status?.inReplyToId) {
      // Build ancestor chain
      let currentId: string | null = status.inReplyToId;
      while (currentId) {
        const parent = getStatusById(currentId);
        if (parent) {
          ancestors.unshift(parent);
          currentId = parent.inReplyToId ?? null;
        }
        else {
          break;
        }
      }
    }

    // Find descendants by looking through all thread contexts
    for (const context of Object.values(mockThreadContexts)) {
      for (const reply of context.descendants) {
        if (reply.inReplyToId === id) {
          descendants.push(reply);
          // Also find nested replies to this reply
          const nestedReplies = context.descendants.filter(
            r => r.inReplyToId === reply.id,
          );
          descendants.push(...nestedReplies);
        }
      }
    }

    return { ancestors, descendants };
  }

  function getProfileUrl(acct: string): string {
    const cleanAcct = acct.replace(/^@/, '');
    return `/@${cleanAcct}`;
  }

  function getNotifications(): Notification[] {
    return mockNotifications;
  }

  function getFavouritedStatuses(): Status[] {
    return mockFavouritedStatuses;
  }

  function getBookmarkedStatuses(): Status[] {
    return mockBookmarkedStatuses;
  }

  function getTrendingTags(): Tag[] {
    return trendingTags;
  }

  function searchAccounts(query: string): Account[] {
    if (!query.trim())
      return [];
    const lowerQuery = query.toLowerCase();
    return Object.values(mockAccounts).filter(
      account =>
        account.displayName.toLowerCase().includes(lowerQuery)
        || account.acct.toLowerCase().includes(lowerQuery)
        || account.username.toLowerCase().includes(lowerQuery),
    );
  }

  function searchTags(query: string): Tag[] {
    if (!query.trim())
      return [];
    const lowerQuery = query.toLowerCase();
    return trendingTags.filter(tag =>
      tag.name.toLowerCase().includes(lowerQuery),
    );
  }

  function getStatusesByTag(tagName: string): Status[] {
    const normalizedTag = tagName.toLowerCase().replace(/^#/, '');

    // Get statuses from the dedicated tag feeds
    const dedicatedStatuses = taggedStatuses[normalizedTag] || [];

    // Also search through all statuses for this tag
    const timelineWithTag = mockStatuses.filter(status =>
      status.tags.some(tag => tag.name.toLowerCase() === normalizedTag),
    );

    // Combine and dedupe by id
    const allStatuses = [...dedicatedStatuses, ...timelineWithTag];
    const seen = new Set<string>();
    const uniqueStatuses = allStatuses.filter((status) => {
      if (seen.has(status.id))
        return false;
      seen.add(status.id);
      return true;
    });

    // Sort by date, newest first
    return uniqueStatuses.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  function getTagInfo(tagName: string): Tag | undefined {
    const normalizedTag = tagName.toLowerCase().replace(/^#/, '');
    return trendingTags.find(tag => tag.name.toLowerCase() === normalizedTag);
  }

  function getStatusesByLink(linkUrl: string): Status[] {
    const decodedUrl = decodeURIComponent(linkUrl);
    const results: Status[] = [];
    const seen = new Set<string>();

    function addStatus(status: Status) {
      if (!seen.has(status.id)) {
        seen.add(status.id);
        results.push(status);
      }
    }

    // Search through link statuses first
    for (const status of linkStatuses) {
      if (status.card?.url === decodedUrl) {
        addStatus(status);
      }
    }

    // Search through all statuses for ones with matching preview cards
    for (const status of mockStatuses) {
      if (status.card?.url === decodedUrl) {
        addStatus(status);
      }
    }

    // Also check tagged statuses
    for (const statuses of Object.values(taggedStatuses)) {
      for (const status of statuses) {
        if (status.card?.url === decodedUrl) {
          addStatus(status);
        }
      }
    }

    // Sort by date, newest first
    return results.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  function getLinkInfo(linkUrl: string): { url: string; title: string; source: string } | undefined {
    const decodedUrl = decodeURIComponent(linkUrl);

    // Check link statuses first
    for (const status of linkStatuses) {
      if (status.card?.url === decodedUrl) {
        return {
          url: status.card.url,
          title: status.card.title,
          source: status.card.providerName || new URL(decodedUrl).hostname,
        };
      }
    }

    // Check if any status has this link as a card
    for (const status of mockStatuses) {
      if (status.card?.url === decodedUrl) {
        return {
          url: status.card.url,
          title: status.card.title,
          source: status.card.providerName || new URL(decodedUrl).hostname,
        };
      }
    }

    // Return basic info from the URL
    try {
      const url = new URL(decodedUrl);
      return {
        url: decodedUrl,
        title: decodedUrl,
        source: url.hostname.replace('www.', ''),
      };
    }
    catch {
      return undefined;
    }
  }

  function searchStatuses(query: string): Status[] {
    if (!query.trim())
      return [];
    const lowerQuery = query.toLowerCase();

    // Search in main timeline
    const timelineResults = mockStatuses.filter(status =>
      status.content.toLowerCase().includes(lowerQuery)
      || status.tags.some(tag => tag.name.toLowerCase().includes(lowerQuery)),
    );

    // Search in tagged statuses
    const taggedResults: Status[] = [];
    for (const statuses of Object.values(taggedStatuses)) {
      for (const status of statuses) {
        if (
          status.content.toLowerCase().includes(lowerQuery)
          || status.tags.some(tag => tag.name.toLowerCase().includes(lowerQuery))
        ) {
          taggedResults.push(status);
        }
      }
    }

    // Combine and dedupe
    const allResults = [...timelineResults, ...taggedResults];
    const seen = new Set<string>();
    return allResults.filter((status) => {
      if (seen.has(status.id))
        return false;
      seen.add(status.id);
      return true;
    });
  }

  return {
    getAccountByAcct,
    getAccountStatuses,
    getAllAccounts,
    getSuggestedAccounts,
    getHomeTimeline,
    getProfileUrl,
    getNotifications,
    getFavouritedStatuses,
    getBookmarkedStatuses,
    getTrendingTags,
    searchAccounts,
    searchTags,
    getStatusById,
    getStatusContext,
    getStatusesByTag,
    getTagInfo,
    getStatusesByLink,
    getLinkInfo,
    searchStatuses,
  };
}
