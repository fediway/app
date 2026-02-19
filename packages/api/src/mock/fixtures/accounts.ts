import type { Account } from '@repo/types';

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

export const mockAccounts: Record<string, Account> = {
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
      { name: 'Coffee', value: 'Espresso lover' },
    ],
  ),
};

export const suggestedAccounts: Account[] = [
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

export const currentUserAccount = mockAccounts['jane@social.network']!;

export const janeAccount = mockAccounts['jane@social.network']!;
export const sarahAccount = mockAccounts['sarah@social.network']!;
export const marcusAccount = mockAccounts['marcus.j@federated.social']!;
export const emilyAccount = mockAccounts['emily_r@mastodon.social']!;

export function allAccounts(): Account[] {
  return [...Object.values(mockAccounts), ...suggestedAccounts];
}
