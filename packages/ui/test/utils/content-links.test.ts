import { describe, expect, it } from 'vitest';
import { extractTagName, resolveMentionAcct } from '../../src/utils/content-links';

describe('resolveMentionAcct', () => {
  const mentions = [
    { id: '1', username: 'alice', acct: 'alice', url: 'https://mastodon.social/@alice' },
    { id: '2', username: 'bob', acct: 'bob@fosstodon.org', url: 'https://fosstodon.org/@bob' },
    { id: '3', username: 'carol', acct: 'carol@mstdn.jp', url: 'https://mstdn.jp/@carol' },
  ];

  describe('resolves by URL match (most reliable)', () => {
    it('matches local user by exact URL', () => {
      expect(resolveMentionAcct('https://mastodon.social/@alice', '@alice', mentions)).toBe('alice');
    });

    it('matches remote user by exact URL', () => {
      expect(resolveMentionAcct('https://fosstodon.org/@bob', '@bob', mentions)).toBe('bob@fosstodon.org');
    });

    it('matches URL with trailing slash', () => {
      expect(resolveMentionAcct('https://mastodon.social/@alice/', '@alice', mentions)).toBe('alice');
    });
  });

  describe('resolves by username from link text', () => {
    it('matches by username when URL does not match', () => {
      expect(resolveMentionAcct('https://other.instance/@alice', '@alice', mentions)).toBe('alice');
    });

    it('matches by acct when link text includes domain', () => {
      expect(resolveMentionAcct('https://other.instance/@bob', '@bob@fosstodon.org', mentions)).toBe('bob@fosstodon.org');
    });

    it('strips leading @ from link text', () => {
      expect(resolveMentionAcct('https://unknown.tld/@alice', '@alice', mentions)).toBe('alice');
    });
  });

  describe('resolves by URL parsing (fallback)', () => {
    it('extracts user@domain from URL when not in mentions', () => {
      expect(resolveMentionAcct('https://example.com/@dave', '@dave', [])).toBe('dave@example.com');
    });

    it('preserves already-qualified acct in URL', () => {
      expect(resolveMentionAcct('https://mastodon.social/@eve@other.social', '@eve', [])).toBe('eve@other.social');
    });

    it('handles URL with trailing slash', () => {
      expect(resolveMentionAcct('https://example.com/@frank/', '@frank', [])).toBe('frank@example.com');
    });
  });

  describe('returns null when unresolvable', () => {
    it('returns null for non-mention URLs', () => {
      expect(resolveMentionAcct('https://example.com/some/page', 'text', [])).toBeNull();
    });

    it('returns null for empty href', () => {
      expect(resolveMentionAcct('', '@alice', [])).toBeNull();
    });
  });
});

describe('extractTagName', () => {
  describe('extracts from URL', () => {
    it('extracts from /tags/ URL pattern', () => {
      expect(extractTagName('https://mastodon.social/tags/vue', '#vue')).toBe('vue');
    });

    it('extracts from /tag/ URL pattern (singular)', () => {
      expect(extractTagName('https://mastodon.social/tag/rust', '#rust')).toBe('rust');
    });

    it('handles trailing slash', () => {
      expect(extractTagName('https://mastodon.social/tags/nuxt/', '#nuxt')).toBe('nuxt');
    });

    it('lowercases tag name from URL', () => {
      expect(extractTagName('https://mastodon.social/tags/VueJS', '#VueJS')).toBe('vuejs');
    });
  });

  describe('falls back to link text', () => {
    it('extracts from link text when URL does not match', () => {
      expect(extractTagName('https://example.com/unknown', '#typescript')).toBe('typescript');
    });

    it('strips leading # from link text', () => {
      expect(extractTagName('https://example.com', '#fediverse')).toBe('fediverse');
    });
  });

  describe('returns null when unresolvable', () => {
    it('returns null for empty link text and non-matching URL', () => {
      expect(extractTagName('https://example.com', '')).toBeNull();
    });

    it('returns null for just a # with no text', () => {
      expect(extractTagName('https://example.com', '#')).toBeNull();
    });
  });
});
