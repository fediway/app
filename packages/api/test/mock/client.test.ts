import type { FediwayStatus } from '@repo/types';
import { describe, expect, it } from 'vitest';
import { createMockClient } from '../../src/mock/client';

describe('createMockClient', () => {
  it('returns a valid MastoClient shape', () => {
    const client = createMockClient();
    expect(client).toHaveProperty('rest');
    expect(client).toHaveProperty('fediway');
    expect(client).toHaveProperty('config');
    expect(client).toHaveProperty('isAuthenticated');
  });

  it('is not authenticated', () => {
    const client = createMockClient();
    expect(client.isAuthenticated).toBe(false);
  });

  it('rest.v1.timelines.home.list() returns statuses array', async () => {
    const client = createMockClient();
    const statuses = await client.rest.v1.timelines.home.list();
    expect(Array.isArray(statuses)).toBe(true);
    expect(statuses.length).toBeGreaterThan(0);
    expect(statuses[0]).toHaveProperty('id');
    expect(statuses[0]).toHaveProperty('content');
    expect(statuses[0]).toHaveProperty('account');
  });

  it('rest.v1.statuses.$select(id).fetch() returns correct status', async () => {
    const client = createMockClient();
    const status = await client.rest.v1.statuses.$select('1').fetch();
    expect(status.id).toBe('1');
    expect(status.account.username).toBe('sarah');
  });

  it('rest.v1.statuses.$select(id).context.fetch() returns ancestors/descendants', async () => {
    const client = createMockClient();
    const context = await client.rest.v1.statuses.$select('1').context.fetch();
    expect(context).toHaveProperty('ancestors');
    expect(context).toHaveProperty('descendants');
    expect(Array.isArray(context.ancestors)).toBe(true);
    expect(Array.isArray(context.descendants)).toBe(true);
    expect(context.ancestors.length).toBeGreaterThan(0);
    expect(context.descendants.length).toBeGreaterThan(0);
  });

  it('rest.v1.statuses.$select(id).favourite() toggles favourited state', async () => {
    const client = createMockClient();
    const before = await client.rest.v1.statuses.$select('2').fetch();
    expect(before.favourited).toBe(false);

    const after = await client.rest.v1.statuses.$select('2').favourite();
    expect(after.favourited).toBe(true);

    const reverted = await client.rest.v1.statuses.$select('2').unfavourite();
    expect(reverted.favourited).toBe(false);
  });

  it('rest.v1.statuses.create() returns new status and adds to timeline', async () => {
    const client = createMockClient();
    const beforeCount = (await client.rest.v1.timelines.home.list()).length;
    const created = await client.rest.v1.statuses.create({ status: 'Hello world!' });

    expect(created.id).toBeTruthy();
    expect(created.content).toContain('Hello world!');
    expect(created.account.username).toBe('jane');

    const afterCount = (await client.rest.v1.timelines.home.list()).length;
    expect(afterCount).toBe(beforeCount + 1);
  });

  it('rest.v1.accounts.lookup() finds account by acct', async () => {
    const client = createMockClient();
    const account = await client.rest.v1.accounts.lookup({ acct: 'sarah@social.network' });
    expect(account.username).toBe('sarah');
    expect(account.displayName).toBe('Sarah Chen');
  });

  it('rest.v1.notifications.list() returns notifications', async () => {
    const client = createMockClient();
    const notifications = await client.rest.v1.notifications.list();
    expect(Array.isArray(notifications)).toBe(true);
    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0]).toHaveProperty('type');
    expect(notifications[0]).toHaveProperty('account');
  });

  it('rest.v2.search.list() filters by query and type', async () => {
    const client = createMockClient();
    const accountResult = await client.rest.v2.search.list({ q: 'sarah', type: 'accounts' });
    expect(accountResult.accounts.length).toBeGreaterThan(0);
    expect(accountResult.accounts[0]!.username).toBe('sarah');

    const statusResult = await client.rest.v2.search.list({ q: 'coffee', type: 'statuses' });
    expect(statusResult.statuses.length).toBeGreaterThan(0);

    const tagResult = await client.rest.v2.search.list({ q: 'photo', type: 'hashtags' });
    expect(tagResult.hashtags.length).toBeGreaterThan(0);
  });

  it('fediway.getItem() returns ItemAggregation', async () => {
    const client = createMockClient();
    const item = await client.fediway.getItem('https://openlibrary.org/works/OL893415W');
    expect(item.item.title).toBe('Dune');
    expect(item.item.type).toBe('book');
    expect(item.averageRating).toBe(4.2);
    expect(item.ratingCount).toBe(847);
    expect(item.ratingDistribution).toHaveLength(5);
    expect(item.friendsTakes.length).toBeGreaterThan(0);
    expect(item.recentTakes.length).toBeGreaterThan(0);
  });

  it('fediway.getItemStatuses() returns FediwayStatus array', async () => {
    const client = createMockClient();
    const statuses = await client.fediway.getItemStatuses('https://openlibrary.org/works/OL893415W');
    expect(Array.isArray(statuses)).toBe(true);
    expect(statuses.length).toBeGreaterThan(0);
    const first = statuses[0] as FediwayStatus;
    expect(first.item).toBeDefined();
    expect(first.rating).toBeDefined();
  });

  it('timeline contains statuses with Fediway items and ratings', async () => {
    const client = createMockClient();
    const statuses = await client.rest.v1.timelines.home.list();
    const fediwayStatuses = (statuses as FediwayStatus[]).filter(s => s.item && s.rating);
    expect(fediwayStatuses.length).toBeGreaterThanOrEqual(4);

    const bookReview = fediwayStatuses.find(s => s.item?.type === 'book');
    expect(bookReview).toBeDefined();
    expect(bookReview!.rating!.value).toBe(4);

    const movieReview = fediwayStatuses.find(s => s.item?.type === 'movie');
    expect(movieReview).toBeDefined();
    expect(movieReview!.rating!.value).toBe(5);

    const songShare = fediwayStatuses.find(s => s.item?.type === 'song');
    expect(songShare).toBeDefined();
    expect(songShare!.rating!.value).toBe(3);

    const linkRating = fediwayStatuses.find(s => s.item?.type === 'link');
    expect(linkRating).toBeDefined();
    expect(linkRating!.rating!.value).toBe(4);
  });
});
