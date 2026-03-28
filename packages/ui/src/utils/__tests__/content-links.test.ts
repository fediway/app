import { describe, expect, it } from 'vitest';
import { extractTagName, resolveMentionAcct } from '../content-links';

describe('resolveMentionAcct', () => {
  const mentions = [
    { id: '1', url: 'https://mastodon.social/@alice', username: 'alice', acct: 'alice@mastodon.social' },
    { id: '2', url: 'https://fosstodon.org/@bob', username: 'bob', acct: 'bob@fosstodon.org' },
    { id: '3', url: 'https://mastodon.social/@carol', username: 'carol', acct: 'carol' },
  ];

  describe('match by URL', () => {
    it('matches exact URL', () => {
      expect(resolveMentionAcct('https://mastodon.social/@alice', '@alice', mentions)).toBe('alice@mastodon.social');
    });

    it('matches URL with trailing slash', () => {
      expect(resolveMentionAcct('https://mastodon.social/@alice/', '@alice', mentions)).toBe('alice@mastodon.social');
    });
  });

  describe('match by username', () => {
    it('matches by acct from link text', () => {
      expect(resolveMentionAcct('https://unknown.example/@alice', '@alice@mastodon.social', mentions)).toBe('alice@mastodon.social');
    });

    it('matches by username from link text (strips @)', () => {
      expect(resolveMentionAcct('https://unknown.example/@bob', '@bob', mentions)).toBe('bob@fosstodon.org');
    });
  });

  describe('parse URL directly', () => {
    it('parses mention from URL pattern', () => {
      expect(resolveMentionAcct('https://example.com/@newuser', '@newuser', [])).toBe('newuser@example.com');
    });
  });

  describe('edge cases', () => {
    it('returns null for empty href', () => {
      expect(resolveMentionAcct('', '@alice', mentions)).toBeNull();
    });

    it('returns null for non-matching mention', () => {
      expect(resolveMentionAcct('https://example.com/not-a-mention', '@unknown', [])).toBeNull();
    });
  });
});

describe('extractTagName', () => {
  it('extracts tag from URL', () => {
    expect(extractTagName('https://mastodon.social/tags/fediverse', '#fediverse')).toBe('fediverse');
  });

  it('extracts tag from /tag/ URL (singular)', () => {
    expect(extractTagName('https://mastodon.social/tag/fediverse', '#fediverse')).toBe('fediverse');
  });

  it('lowercases tag from URL', () => {
    expect(extractTagName('https://mastodon.social/tags/FediVerse', '#FediVerse')).toBe('fediverse');
  });

  it('falls back to link text when URL does not match', () => {
    expect(extractTagName('https://example.com/unknown', '#hello')).toBe('hello');
  });

  it('strips # from link text fallback', () => {
    expect(extractTagName('https://example.com/unknown', '#world')).toBe('world');
  });

  it('returns null for empty link text fallback', () => {
    expect(extractTagName('https://example.com/unknown', '#')).toBeNull();
    expect(extractTagName('https://example.com/unknown', '')).toBeNull();
  });

  it('handles URL with trailing slash', () => {
    expect(extractTagName('https://mastodon.social/tags/test/', '#test')).toBe('test');
  });
});
