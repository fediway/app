import type { Account, Status } from '@repo/types';
import { reactive } from 'vue';
import { escapeHtml } from '../../utils/html';
import { invalidateAllQueries } from '../createQuery';
import { useAuth } from '../useAuth';
import { useClient } from '../useClient';

// Module-level state — persists across page navigations
const userPosts = reactive<Status[]>([]);

let nextId = 1000;

export interface UsePostsCallbacks {
  onPublished?: (status: Status) => void;
  onError?: (err: unknown) => void;
  onAuthError?: () => void;
}

export function usePosts(callbacks?: UsePostsCallbacks) {
  function addPost(opts: {
    content: string;
    spoilerText?: string;
    visibility?: string;
    inReplyToId?: string | null;
    inReplyToAccountId?: string | null;
    poll?: {
      options: string[];
      expiresIn: number;
      multiple?: boolean;
    };
    mediaIds?: string[];
  }): Status {
    const tempId = `temp-${nextId++}`;
    const { currentUser } = useAuth();
    if (!currentUser.value) {
      callbacks?.onAuthError?.();
      throw new Error('Cannot create post without authenticated user');
    }
    const account = currentUser.value;

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

    let client;
    try {
      client = useClient();
    }
    catch {
      // No client — remove placeholder, can't publish
      const idx = userPosts.findIndex(s => s.id === tempId);
      if (idx !== -1)
        userPosts.splice(idx, 1);
      return placeholder;
    }

    (async () => {
      try {
        const createParams: Record<string, unknown> = {
          status: opts.content,
          spoilerText: opts.spoilerText || undefined,
          visibility: (opts.visibility ?? 'public') as 'public' | 'unlisted' | 'private' | 'direct',
          inReplyToId: opts.inReplyToId || undefined,
        };
        if (opts.poll) {
          createParams.poll = opts.poll;
        }
        if (opts.mediaIds) {
          createParams.mediaIds = opts.mediaIds;
        }
        const created = await client.rest.v1.statuses.create(createParams as any);
        const idx = userPosts.findIndex(s => s.id === tempId);
        if (idx !== -1) {
          userPosts.splice(idx, 1, created);
        }
        invalidateAllQueries();
        callbacks?.onPublished?.(created);
      }
      catch (err) {
        const idx = userPosts.findIndex(s => s.id === tempId);
        if (idx !== -1) {
          userPosts.splice(idx, 1);
        }
        callbacks?.onError?.(err);
      }
    })();

    return placeholder;
  }

  return { userPosts, addPost };
}

/** Reset all state — for testing only */
export function _resetPostsState() {
  userPosts.splice(0, userPosts.length);
  nextId = 1000;
}
