import type { Account, Status } from '@repo/types';
import { useAuth } from '@repo/api';
import { reactive } from 'vue';
import { clearLiveCache } from './useData';
import { useDataMode } from './useDataMode';

// Module-level state — persists across page navigations
const userPosts = reactive<Status[]>([]);

let nextId = 1000;

// The current user's account (matches mock data)
const currentUserAccount: Account = {
  id: '0',
  username: 'jane',
  acct: 'jane@social.network',
  url: 'https://social.network/@jane',
  displayName: 'Jane Doe',
  note: '<p>Product designer & coffee addict. Building beautiful things on the fediverse.</p>',
  avatar: 'https://picsum.photos/seed/jane/200/200',
  avatarStatic: 'https://picsum.photos/seed/jane/200/200',
  header: 'https://picsum.photos/seed/jane-header/800/300',
  headerStatic: 'https://picsum.photos/seed/jane-header/800/300',
  locked: false,
  fields: [],
  emojis: [],
  bot: false,
  group: false,
  createdAt: '2023-01-15T00:00:00.000Z',
  lastStatusAt: new Date().toISOString().split('T')[0] as string,
  statusesCount: 234,
  followersCount: 1847,
  followingCount: 412,
} as unknown as Account;

export function usePosts() {
  const { mode } = useDataMode();

  function addPost(opts: {
    content: string;
    spoilerText?: string;
    visibility?: string;
    inReplyToId?: string | null;
    inReplyToAccountId?: string | null;
  }): Status {
    if (mode.value === 'live') {
      return addPostLive(opts);
    }
    return addPostMock(opts);
  }

  function addPostMock(opts: {
    content: string;
    spoilerText?: string;
    visibility?: string;
    inReplyToId?: string | null;
    inReplyToAccountId?: string | null;
  }): Status {
    const id = `user-${nextId++}`;
    const status: Status = {
      id,
      uri: `https://social.network/statuses/${id}`,
      createdAt: new Date().toISOString(),
      editedAt: null,
      account: currentUserAccount,
      content: `<p>${escapeHtml(opts.content)}</p>`,
      visibility: (opts.visibility ?? 'public') as Status['visibility'],
      sensitive: false,
      spoilerText: opts.spoilerText ?? '',
      mediaAttachments: [],
      application: { name: 'Web' },
      mentions: [],
      tags: [],
      emojis: [],
      reblogsCount: 0,
      favouritesCount: 0,
      repliesCount: 0,
      quotesCount: 0,
      quoteApproval: {
        automatic: ['public'],
        manual: [],
        currentUser: 'automatic',
      },
      url: `https://social.network/@jane/${id}`,
      inReplyToId: opts.inReplyToId ?? null,
      inReplyToAccountId: opts.inReplyToAccountId ?? null,
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
    } as unknown as Status;

    userPosts.unshift(status);
    return status;
  }

  function addPostLive(opts: {
    content: string;
    spoilerText?: string;
    visibility?: string;
    inReplyToId?: string | null;
    inReplyToAccountId?: string | null;
  }): Status {
    // Create a temporary placeholder that will show immediately
    const tempId = `temp-${nextId++}`;
    const { currentUser } = useAuth();
    const account = currentUser.value ?? currentUserAccount;

    const placeholder: Status = {
      id: tempId,
      uri: '',
      createdAt: new Date().toISOString(),
      editedAt: null,
      account: account as unknown as Account,
      content: `<p>${escapeHtml(opts.content)}</p>`,
      visibility: (opts.visibility ?? 'public') as Status['visibility'],
      sensitive: false,
      spoilerText: opts.spoilerText ?? '',
      mediaAttachments: [],
      application: { name: 'Fediway' },
      mentions: [],
      tags: [],
      emojis: [],
      reblogsCount: 0,
      favouritesCount: 0,
      repliesCount: 0,
      quotesCount: 0,
      quoteApproval: {
        automatic: ['public'],
        manual: [],
        currentUser: 'automatic',
      },
      url: '',
      inReplyToId: opts.inReplyToId ?? null,
      inReplyToAccountId: opts.inReplyToAccountId ?? null,
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
    } as unknown as Status;

    userPosts.unshift(placeholder);

    // Fire the real API call
    const { getClient } = useAuth();
    const client = getClient();
    if (client) {
      (async () => {
        try {
          const created = await client.rest.v1.statuses.create({
            status: opts.content,
            spoilerText: opts.spoilerText || undefined,
            visibility: (opts.visibility ?? 'public') as 'public' | 'unlisted' | 'private' | 'direct',
            inReplyToId: opts.inReplyToId || undefined,
          });
          // Replace placeholder with real status
          const idx = userPosts.findIndex(s => s.id === tempId);
          if (idx !== -1) {
            userPosts.splice(idx, 1, created);
          }
          // Clear the home timeline cache so it re-fetches with the new post
          clearLiveCache();
        }
        catch (err) {
          console.error('[usePosts] Failed to create status:', err);
          // Remove placeholder on failure
          const idx = userPosts.findIndex(s => s.id === tempId);
          if (idx !== -1) {
            userPosts.splice(idx, 1);
          }
        }
      })();
    }

    return placeholder;
  }

  return { userPosts, addPost, currentUserAccount };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}
