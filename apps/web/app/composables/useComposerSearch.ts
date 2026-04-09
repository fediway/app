import { useClient } from '@repo/api';
import { onBeforeUnmount, ref, watch } from 'vue';

export function useComposerSearch(isOpen: () => boolean) {
  let mentionAbort: AbortController | undefined;
  let hashtagAbort: AbortController | undefined;
  let cachedCustomEmoji: any[] | null = null;

  const allEmoji = ref<any[]>([]);

  async function searchMentions(query: string) {
    mentionAbort?.abort();
    mentionAbort = new AbortController();
    const signal = mentionAbort.signal;
    await new Promise(r => setTimeout(r, 250));
    if (signal.aborted)
      return [];
    try {
      const client = useClient();
      const results = await client.rest.v2.search.list({ q: query, type: 'accounts', limit: 8, resolve: true });
      if (signal.aborted)
        return [];
      return results.accounts.map(a => ({
        id: a.acct,
        acct: a.acct,
        displayName: a.displayName || a.username,
        avatar: a.avatar,
      }));
    }
    catch {
      return [];
    }
  }

  async function searchHashtags(query: string) {
    hashtagAbort?.abort();
    hashtagAbort = new AbortController();
    const signal = hashtagAbort.signal;
    await new Promise(r => setTimeout(r, 250));
    if (signal.aborted)
      return [];
    try {
      const client = useClient();
      const results = await client.rest.v2.search.list({ q: query, type: 'hashtags', limit: 8 });
      if (signal.aborted)
        return [];
      return results.hashtags.map(t => ({
        name: t.name,
        postCount: t.history?.[0]?.uses ? Number(t.history[0].uses) : undefined,
      }));
    }
    catch {
      return [];
    }
  }

  async function loadCustomEmoji() {
    if (cachedCustomEmoji)
      return cachedCustomEmoji;
    try {
      const client = useClient();
      const emoji = await client.rest.v1.customEmojis.list();
      cachedCustomEmoji = emoji
        .filter(e => e.visibleInPicker)
        .map(e => ({
          shortcode: e.shortcode,
          url: e.staticUrl || e.url,
          category: e.category || 'Custom',
        }));
      return cachedCustomEmoji;
    }
    catch {
      return [];
    }
  }

  async function searchEmoji(query: string) {
    const custom = await loadCustomEmoji();
    const q = query.toLowerCase();
    return custom
      .filter(e => e.shortcode.toLowerCase().includes(q))
      .slice(0, 10);
  }

  watch(isOpen, async (open) => {
    if (open && allEmoji.value.length === 0) {
      allEmoji.value = await loadCustomEmoji();
    }
  }, { immediate: false });

  onBeforeUnmount(() => {
    mentionAbort?.abort();
    hashtagAbort?.abort();
  });

  return {
    allEmoji,
    searchMentions,
    searchHashtags,
    searchEmoji,
  };
}
