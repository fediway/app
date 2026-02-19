import type { ShareReceivedEvent } from '../../src/composables/useShareTarget';
import { describe, expect, it, vi } from 'vitest';
import { useShareTarget } from '../../src/composables/useShareTarget';
import { withSetup } from '../utils/withSetup';

describe('useShareTarget', () => {
  describe('sharedContent state', () => {
    it('starts as null', () => {
      const [st] = withSetup(() => useShareTarget());
      expect(st.sharedContent.value).toBeNull();
    });

    it('is set after handleShare', async () => {
      const [st] = withSetup(() => useShareTarget());
      await st.handleShare({ texts: ['https://example.com'] });
      expect(st.sharedContent.value).not.toBeNull();
      expect(st.sharedContent.value!.urls).toEqual(['https://example.com']);
    });

    it('is cleared by clear()', async () => {
      const [st] = withSetup(() => useShareTarget());
      await st.handleShare({ texts: ['https://example.com'] });
      st.clear();
      expect(st.sharedContent.value).toBeNull();
    });
  });

  describe('url extraction', () => {
    it('extracts single URL from text', async () => {
      const [st] = withSetup(() => useShareTarget());
      await st.handleShare({ texts: ['https://example.com/page'] });
      expect(st.sharedContent.value!.urls).toEqual(['https://example.com/page']);
    });

    it('extracts URL from "title + URL" text', async () => {
      const [st] = withSetup(() => useShareTarget());
      await st.handleShare({ texts: ['Check this out https://example.com/article'] });
      expect(st.sharedContent.value!.urls).toEqual(['https://example.com/article']);
      expect(st.sharedContent.value!.text).toBe('Check this out');
    });

    it('extracts multiple URLs from multiple texts', async () => {
      const [st] = withSetup(() => useShareTarget());
      await st.handleShare({
        texts: ['https://one.com', 'https://two.com'],
      });
      expect(st.sharedContent.value!.urls).toEqual(['https://one.com', 'https://two.com']);
    });

    it('deduplicates identical URLs', async () => {
      const [st] = withSetup(() => useShareTarget());
      await st.handleShare({
        texts: ['https://example.com', 'Visit https://example.com'],
      });
      expect(st.sharedContent.value!.urls).toEqual(['https://example.com']);
    });

    it('handles text with no URLs (sets text only)', async () => {
      const [st] = withSetup(() => useShareTarget());
      await st.handleShare({ texts: ['Just some text with no links'] });
      expect(st.sharedContent.value!.urls).toEqual([]);
      expect(st.sharedContent.value!.text).toBe('Just some text with no links');
    });

    it('strips trailing punctuation from URLs', async () => {
      const [st] = withSetup(() => useShareTarget());
      await st.handleShare({
        texts: [
          'See https://example.com/a).',
          'Also https://example.com/b],',
        ],
      });
      expect(st.sharedContent.value!.urls).toEqual([
        'https://example.com/a',
        'https://example.com/b',
      ]);
    });

    it('handles empty texts array', async () => {
      const [st] = withSetup(() => useShareTarget());
      await st.handleShare({ texts: [] });
      expect(st.sharedContent.value!.urls).toEqual([]);
      expect(st.sharedContent.value!.text).toBeUndefined();
    });
  });

  describe('onShare callbacks', () => {
    it('fires registered callback with parsed content', async () => {
      const [st] = withSetup(() => useShareTarget());
      const cb = vi.fn();
      st.onShare(cb);

      await st.handleShare({ texts: ['https://example.com'] });
      expect(cb).toHaveBeenCalledOnce();
      expect(cb).toHaveBeenCalledWith(expect.objectContaining({
        urls: ['https://example.com'],
      }));
    });

    it('unregister function removes callback', async () => {
      const [st] = withSetup(() => useShareTarget());
      const cb = vi.fn();
      const unregister = st.onShare(cb);

      unregister();
      await st.handleShare({ texts: ['https://example.com'] });
      expect(cb).not.toHaveBeenCalled();
    });

    it('continues if one callback throws', async () => {
      const [st] = withSetup(() => useShareTarget());
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const before = vi.fn();
      const after = vi.fn();

      st.onShare(before);
      st.onShare(() => {
        throw new Error('boom');
      });
      st.onShare(after);

      await st.handleShare({ texts: ['https://example.com'] });
      expect(before).toHaveBeenCalledOnce();
      expect(after).toHaveBeenCalledOnce();
      expect(consoleSpy).toHaveBeenCalledOnce();
      consoleSpy.mockRestore();
    });
  });

  describe('handleShare processing', () => {
    it('passes through title from event', async () => {
      const [st] = withSetup(() => useShareTarget());
      await st.handleShare({
        title: 'My Article',
        texts: ['https://example.com/article'],
      });
      expect(st.sharedContent.value!.title).toBe('My Article');
    });

    it('sets non-URL text as SharedContent.text', async () => {
      const [st] = withSetup(() => useShareTarget());
      await st.handleShare({
        texts: ['Great read https://example.com/post'],
      });
      expect(st.sharedContent.value!.text).toBe('Great read');
      expect(st.sharedContent.value!.urls).toEqual(['https://example.com/post']);
    });

    it('handles event with no texts gracefully', async () => {
      const [st] = withSetup(() => useShareTarget());
      await st.handleShare({} as ShareReceivedEvent);
      expect(st.sharedContent.value).not.toBeNull();
      expect(st.sharedContent.value!.urls).toEqual([]);
      expect(st.sharedContent.value!.text).toBeUndefined();
    });

    it('handles event with empty strings', async () => {
      const [st] = withSetup(() => useShareTarget());
      await st.handleShare({ texts: ['', '  ', ''] });
      expect(st.sharedContent.value!.urls).toEqual([]);
      expect(st.sharedContent.value!.text).toBeUndefined();
    });
  });
});
