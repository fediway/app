import type { Account, Status } from '@repo/types';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import StatusComponent from '../Status.vue';
import StatusDetailMain from '../StatusDetailMain.vue';

function mockAccount(id: string, name: string): Account {
  return ({
    id,
    username: name.toLowerCase(),
    acct: `${name.toLowerCase()}@test.social`,
    displayName: name,
    url: `https://test.social/@${name.toLowerCase()}`,
    note: '',
    avatar: '',
    avatarStatic: '',
    header: '',
    headerStatic: '',
    locked: false,
    fields: [],
    emojis: [],
    bot: false,
    group: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastStatusAt: '2024-01-01',
    statusesCount: 0,
    followersCount: 0,
    followingCount: 0,
    roles: [],
    noindex: false,
    discoverable: true,
    suspended: false,
    limited: false,
  }) as Account;
}

function mockStatus(overrides: Partial<Status> = {}): Status {
  return {
    id: '1',
    uri: 'https://test.social/statuses/1',
    createdAt: '2024-01-01T12:00:00.000Z',
    editedAt: null,
    account: mockAccount('1', 'Alice'),
    content: '<p>Hello world</p>',
    visibility: 'public',
    sensitive: false,
    spoilerText: '',
    mediaAttachments: [],
    application: { name: 'Web' },
    mentions: [],
    tags: [],
    emojis: [],
    reblogsCount: 0,
    favouritesCount: 0,
    repliesCount: 0,
    quotesCount: 0,
    quoteApproval: { automatic: ['public'], manual: [], currentUser: 'automatic' },
    url: 'https://test.social/@alice/1',
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
    ...overrides,
  } as unknown as Status;
}

const quotedStatus = mockStatus({
  id: '99',
  content: '<p>I am the quoted post</p>',
  account: mockAccount('2', 'Bob'),
  url: 'https://test.social/@bob/99',
});

describe('quote rendering in Status.vue', () => {
  it('renders StatusQuote when quote has camelCase quotedStatus', () => {
    const status = mockStatus({
      content: '<p class="quote-inline">RE: <a href="https://test.social/@bob/99">https://test.social/@bob/99</a></p><p>My take on this</p>',
      quote: { state: 'accepted', quotedStatus } as Status['quote'],
    });

    const wrapper = mount(StatusComponent, {
      props: { status },
      shallow: true,
    });

    expect(wrapper.findComponent({ name: 'StatusQuote' }).exists()).toBe(true);
  });

  it('renders StatusQuote when quote has snake_case quoted_status', () => {
    const status = mockStatus({
      content: '<p class="quote-inline">RE: <a href="https://test.social/@bob/99">https://test.social/@bob/99</a></p><p>My take on this</p>',
      // Simulate snake_case from API
      quote: { state: 'accepted', quoted_status: quotedStatus } as unknown as Status['quote'],
    });

    const wrapper = mount(StatusComponent, {
      props: { status },
      shallow: true,
    });

    expect(wrapper.findComponent({ name: 'StatusQuote' }).exists()).toBe(true);
  });

  it('does not render StatusQuote when quote is null', () => {
    const status = mockStatus({
      content: '<p>Just a regular post</p>',
      quote: null,
    });

    const wrapper = mount(StatusComponent, {
      props: { status },
      shallow: true,
    });

    expect(wrapper.findComponent({ name: 'StatusQuote' }).exists()).toBe(false);
  });

  it('strips the RE: paragraph from rendered content', () => {
    const status = mockStatus({
      content: '<p class="quote-inline">RE: <a href="https://test.social/@bob/99"><span class="invisible">https://</span><span class="ellipsis">test.social/@bob/</span><span class="invisible">99</span></a></p><p>My take on this</p>',
      quote: { state: 'accepted', quotedStatus } as Status['quote'],
    });

    const wrapper = mount(StatusComponent, {
      props: { status },
      shallow: true,
    });

    const content = wrapper.findComponent({ name: 'StatusContent' });
    expect(content.props('content')).not.toContain('RE:');
    expect(content.props('content')).toContain('My take on this');
  });
});

describe('quote rendering in StatusDetailMain.vue', () => {
  it('renders StatusQuote when quote has camelCase quotedStatus', () => {
    const status = mockStatus({
      content: '<p class="quote-inline">RE: <a href="https://test.social/@bob/99">https://test.social/@bob/99</a></p><p>My take</p>',
      quote: { state: 'accepted', quotedStatus } as Status['quote'],
    });

    const wrapper = mount(StatusDetailMain, {
      props: { status },
      shallow: true,
    });

    expect(wrapper.findComponent({ name: 'StatusQuote' }).exists()).toBe(true);
  });

  it('renders StatusQuote when quote has snake_case quoted_status', () => {
    const status = mockStatus({
      content: '<p class="quote-inline">RE: <a href="https://test.social/@bob/99">https://test.social/@bob/99</a></p><p>My take</p>',
      quote: { state: 'accepted', quoted_status: quotedStatus } as unknown as Status['quote'],
    });

    const wrapper = mount(StatusDetailMain, {
      props: { status },
      shallow: true,
    });

    expect(wrapper.findComponent({ name: 'StatusQuote' }).exists()).toBe(true);
  });

  it('does not render StatusQuote when quote is null', () => {
    const status = mockStatus({ quote: null });

    const wrapper = mount(StatusDetailMain, {
      props: { status },
      shallow: true,
    });

    expect(wrapper.findComponent({ name: 'StatusQuote' }).exists()).toBe(false);
  });
});
