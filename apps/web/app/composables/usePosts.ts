import type { Account, Status } from '@repo/types';
import { useAuth, useClient } from '@repo/api';
import { useToast } from '@repo/ui';
import { reactive } from 'vue';
import { clearAllCaches } from './useDataHelpers';

const AMPERSAND_RE = /&/g;
const LESS_THAN_RE = /</g;
const GREATER_THAN_RE = />/g;
const NEWLINE_RE = /\n/g;

// Module-level state — persists across page navigations
const userPosts = reactive<Status[]>([]);

let nextId = 1000;

export function usePosts() {
  const { toast } = useToast();
  function addPost(opts: {
    content: string;
    spoilerText?: string;
    visibility?: string;
    inReplyToId?: string | null;
    inReplyToAccountId?: string | null;
  }): Status {
    const tempId = `temp-${nextId++}`;
    const { currentUser } = useAuth();
    if (!currentUser.value) {
      toast.error('Not signed in');
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

    // Fire the real API call (works for both mock and live clients)
    let client;
    try {
      client = useClient();
    }
    catch {
      // No client available — placeholder stays as-is
    }

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
          clearAllCaches();
          toast.success('Post published');
        }
        catch (err) {
          console.error('[usePosts] Failed to create status:', err);
          toast.error('Failed to post', 'Please try again.');
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

  return { userPosts, addPost };
}

function escapeHtml(text: string): string {
  return text
    .replace(AMPERSAND_RE, '&amp;')
    .replace(LESS_THAN_RE, '&lt;')
    .replace(GREATER_THAN_RE, '&gt;')
    .replace(NEWLINE_RE, '<br>');
}

/** Reset all state — for testing only */
export function _resetPostsState() {
  userPosts.splice(0, userPosts.length);
  nextId = 1000;
}
