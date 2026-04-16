import { describe, expect, it } from 'vitest';
import { extractQuoteUrl, useCleanContent } from '../useCleanContent';

function clean(content: string, tags: { name: string }[] = []): string {
  const result = useCleanContent(() => content, () => tags);
  return result.value;
}

describe('useCleanContent', () => {
  describe('quote stripping', () => {
    it('always strips RE: quote paragraph', () => {
      const html = '<p>RE: <a href="https://example.com/post">https://example.com/post</a></p><p>My reply</p>';
      expect(clean(html)).toBe('<p>My reply</p>');
    });

    it('strips RE: with plain text URL (no anchor tag)', () => {
      const html = '<p>RE: https://berlin.social/@user/12345</p><p>My reply</p>';
      expect(clean(html)).toBe('<p>My reply</p>');
    });

    it('strips RE: with quote-inline class', () => {
      const html = '<p class="quote-inline">RE: <a href="https://example.com/post">https://example.com/post</a></p><p>My reply</p>';
      expect(clean(html)).toBe('<p>My reply</p>');
    });

    it('strips RE: with nested spans inside anchor (Mastodon link format)', () => {
      const html = '<p class="quote-inline">RE: <a href="https://social.kit.edu/@KIT_Karlsruhe/116407744130800865" rel="nofollow noopener" translate="no" target="_blank"><span class="invisible">https://</span><span class="ellipsis">social.kit.edu/@KIT_Karlsruhe/</span><span class="invisible">116407744130800865</span></a></p><p>My reply</p>';
      expect(clean(html)).toBe('<p>My reply</p>');
    });

    it('handles content with no RE: paragraph', () => {
      const html = '<p>Just a normal post</p>';
      expect(clean(html)).toBe(html);
    });
  });

  describe('trailing hashtag stripping', () => {
    it('strips trailing paragraph of pure hashtags when tags exist', () => {
      const html = '<p>Check this out</p><p><a href="/tags/fediverse" class="hashtag">#fediverse</a> <a href="/tags/mastodon" class="hashtag">#mastodon</a></p>';
      const tags = [{ name: 'fediverse' }, { name: 'mastodon' }];
      expect(clean(html, tags)).toBe('<p>Check this out</p>');
    });

    it('keeps trailing paragraph when no tags', () => {
      const html = '<p>Check this out</p><p><a href="/tags/fediverse" class="hashtag">#fediverse</a></p>';
      expect(clean(html, [])).toBe(html);
    });

    it('keeps mixed content paragraph (not pure hashtags)', () => {
      const html = '<p>Check this out</p><p>Also see <a href="/tags/fediverse" class="hashtag">#fediverse</a></p>';
      const tags = [{ name: 'fediverse' }];
      // The paragraph has text before the hashtag, so it's not pure hashtags
      expect(clean(html, tags)).toBe(html);
    });

    it('handles single hashtag paragraph', () => {
      const html = '<p>Post text</p><p><a href="/tags/test" class="hashtag">#test</a></p>';
      const tags = [{ name: 'test' }];
      expect(clean(html, tags)).toBe('<p>Post text</p>');
    });
  });

  describe('edge cases', () => {
    it('handles empty content', () => {
      expect(clean('')).toBe('');
    });

    it('trims whitespace', () => {
      expect(clean('  <p>hello</p>  ')).toBe('<p>hello</p>');
    });

    it('handles content with only hashtags (entire content stripped)', () => {
      const html = '<p><a href="/tags/test" class="hashtag">#test</a></p>';
      const tags = [{ name: 'test' }];
      expect(clean(html, tags)).toBe('');
    });
  });

  describe('regex safety (no catastrophic backtracking)', () => {
    it('handles deeply nested HTML without hanging', () => {
      // This pattern could cause catastrophic backtracking with .*? but not with [^<]*
      const nested = `<p>${'<a href="/tags/x" class="hashtag">#x</a> '.repeat(50)}</p>`;
      const tags = [{ name: 'x' }];
      const start = performance.now();
      clean(nested, tags);
      const elapsed = performance.now() - start;
      // Should complete in under 100ms, not hang
      expect(elapsed).toBeLessThan(100);
    });

    it('handles long content with many links without hanging', () => {
      const links = Array.from({ length: 100 }, (_, i) =>
        `<a href="https://example.com/${i}" class="mention">@user${i}</a>`).join(' ');
      const html = `<p>${links}</p><p><a href="/tags/test" class="hashtag">#test</a></p>`;
      const tags = [{ name: 'test' }];
      const start = performance.now();
      clean(html, tags);
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100);
    });
  });
});

describe('extractQuoteUrl', () => {
  it('extracts URL from anchor tag in RE: paragraph', () => {
    const html = '<p>RE: <a href="https://example.com/@user/123">https://example.com/@user/123</a></p><p>My reply</p>';
    expect(extractQuoteUrl(html)).toBe('https://example.com/@user/123');
  });

  it('extracts URL from plain text RE: paragraph', () => {
    const html = '<p>RE: https://berlin.social/@user/12345</p><p>My reply</p>';
    expect(extractQuoteUrl(html)).toBe('https://berlin.social/@user/12345');
  });

  it('extracts URL with quote-inline class', () => {
    const html = '<p class="quote-inline">RE: <a href="https://social.kit.edu/@KIT/116407744130800865">https://social.kit.edu/@KIT/116407744130800865</a></p><p>Content</p>';
    expect(extractQuoteUrl(html)).toBe('https://social.kit.edu/@KIT/116407744130800865');
  });

  it('extracts URL when anchor contains nested spans (Mastodon link format)', () => {
    const html = '<p class="quote-inline">RE: <a href="https://social.kit.edu/@KIT_Karlsruhe/116407744130800865" rel="nofollow noopener" translate="no" target="_blank"><span class="invisible">https://</span><span class="ellipsis">social.kit.edu/@KIT_Karlsruhe/</span><span class="invisible">116407744130800865</span></a></p><p>Content here</p>';
    expect(extractQuoteUrl(html)).toBe('https://social.kit.edu/@KIT_Karlsruhe/116407744130800865');
  });

  it('returns null when no RE: paragraph', () => {
    const html = '<p>Just a normal post</p>';
    expect(extractQuoteUrl(html)).toBeNull();
  });

  it('returns null for empty content', () => {
    expect(extractQuoteUrl('')).toBeNull();
  });
});
