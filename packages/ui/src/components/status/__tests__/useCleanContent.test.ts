import { describe, expect, it } from 'vitest';
import { useCleanContent } from '../useCleanContent';

function clean(content: string, tags: { name: string }[] = [], hasQuote = false): string {
  const result = useCleanContent(() => content, () => tags, () => hasQuote);
  return result.value;
}

describe('useCleanContent', () => {
  describe('quote stripping', () => {
    it('strips RE: quote paragraph when hasQuote is true', () => {
      const html = '<p>RE: <a href="https://example.com/post">https://example.com/post</a></p><p>My reply</p>';
      expect(clean(html, [], true)).toBe('<p>My reply</p>');
    });

    it('keeps RE: paragraph when hasQuote is false', () => {
      const html = '<p>RE: <a href="https://example.com/post">https://example.com/post</a></p><p>My reply</p>';
      expect(clean(html, [], false)).toBe(html);
    });

    it('strips RE: with plain text URL (no anchor tag)', () => {
      const html = '<p>RE: https://berlin.social/@user/12345</p><p>My reply</p>';
      expect(clean(html, [], true)).toBe('<p>My reply</p>');
    });

    it('strips RE: with quote-inline class', () => {
      const html = '<p class="quote-inline">RE: <a href="https://example.com/post">https://example.com/post</a></p><p>My reply</p>';
      expect(clean(html, [], true)).toBe('<p>My reply</p>');
    });

    it('handles content with no RE: paragraph', () => {
      const html = '<p>Just a normal post</p>';
      expect(clean(html, [], true)).toBe(html);
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
