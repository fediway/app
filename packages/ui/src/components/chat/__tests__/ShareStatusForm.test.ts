import type { Account, Status } from '@repo/types';
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ShareStatusForm from '../ShareStatusForm.vue';

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

const mockStatus = {
  id: '1',
  content: '<p>Test post</p>',
  createdAt: '2024-01-01T12:00:00.000Z',
  account: mockAccount('1', 'Alice'),
  mediaAttachments: [],
  mentions: [],
  tags: [],
  emojis: [],
  reblogsCount: 0,
  favouritesCount: 0,
  repliesCount: 0,
  visibility: 'public',
  sensitive: false,
  spoilerText: '',
  uri: '',
  url: '',
  favourited: false,
  reblogged: false,
  bookmarked: false,
  muted: false,
  pinned: false,
  poll: null,
  card: null,
  language: 'en',
  editedAt: null,
} as unknown as Status;

const follows = [
  mockAccount('2', 'Bob'),
  mockAccount('3', 'Carol'),
  mockAccount('4', 'Dave'),
];

describe('shareStatusForm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows following list by default', () => {
    const wrapper = mount(ShareStatusForm, {
      props: { status: mockStatus, accounts: follows },
    });
    expect(wrapper.text()).toContain('Bob');
    expect(wrapper.text()).toContain('Carol');
    expect(wrapper.text()).toContain('Dave');
  });

  it('emits search after 250ms debounce', async () => {
    const wrapper = mount(ShareStatusForm, {
      props: { status: mockStatus, accounts: follows },
    });

    const input = wrapper.find('input[type="text"]');
    await input.setValue('test');

    expect(wrapper.emitted('search')).toBeUndefined();

    vi.advanceTimersByTime(250);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('search')).toHaveLength(1);
    expect(wrapper.emitted('search')![0]).toEqual(['test']);
  });

  it('does not emit search for empty input', async () => {
    const wrapper = mount(ShareStatusForm, {
      props: { status: mockStatus, accounts: follows },
    });

    const input = wrapper.find('input[type="text"]');
    await input.setValue('   ');

    vi.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('search')).toBeUndefined();
  });

  it('shows searchResults when searching', async () => {
    const searchResults = [mockAccount('10', 'Zara')];
    const wrapper = mount(ShareStatusForm, {
      props: { status: mockStatus, accounts: follows, searchResults },
    });

    const input = wrapper.find('input[type="text"]');
    await input.setValue('zar');

    expect(wrapper.text()).toContain('Zara');
    expect(wrapper.text()).not.toContain('Bob');
  });

  it('debounces rapid typing — only last value emitted', async () => {
    const wrapper = mount(ShareStatusForm, {
      props: { status: mockStatus, accounts: follows },
    });

    const input = wrapper.find('input[type="text"]');
    await input.setValue('a');
    vi.advanceTimersByTime(100);
    await input.setValue('ab');
    vi.advanceTimersByTime(100);
    await input.setValue('abc');
    vi.advanceTimersByTime(250);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('search')).toHaveLength(1);
    expect(wrapper.emitted('search')![0]).toEqual(['abc']);
  });
});
