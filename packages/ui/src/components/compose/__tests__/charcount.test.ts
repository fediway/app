import { describe, expect, it } from 'vitest';
import { countCharacters, countReplyCharacters, HASHTAG_RE, MENTION_RE } from '../charcount';

describe('countCharacters', () => {
  it('counts plain text by length', () => {
    expect(countCharacters('hello')).toBe(5);
    expect(countCharacters('')).toBe(0);
    expect(countCharacters('a')).toBe(1);
  });

  it('counts an https URL as 23 characters', () => {
    expect(countCharacters('https://example.com')).toBe(23);
    expect(countCharacters('https://example.com/very/long/path?q=1&b=2#anchor')).toBe(23);
  });

  it('counts an http URL as 23 characters', () => {
    expect(countCharacters('http://example.com')).toBe(23);
  });

  it('counts multiple URLs independently', () => {
    // "check " (6) + URL (23) + " and " (5) + URL (23) = 57
    expect(countCharacters('check https://a.com and https://b.com')).toBe(57);
  });

  it('handles URL at start of string', () => {
    // URL (23) + " hello" (6)
    expect(countCharacters('https://example.com hello')).toBe(29);
  });

  it('handles URL at end of string', () => {
    // "visit " (6) + URL (23)
    expect(countCharacters('visit https://example.com')).toBe(29);
  });

  it('does not count non-URLs as 23 chars', () => {
    expect(countCharacters('not://a-url')).toBe(11);
    expect(countCharacters('ftp://files.example.com')).toBe(23); // not http/https
    // Actually ftp doesn't match our regex, so:
    expect(countCharacters('ftp://files.example.com')).toBe('ftp://files.example.com'.length);
  });

  it('handles text with no URLs', () => {
    const text = 'Just a normal post with no links at all!';
    expect(countCharacters(text)).toBe(text.length);
  });

  it('counts emoji as their string length', () => {
    // Most emoji are 1-2 chars in JS string length
    expect(countCharacters('👋')).toBe('👋'.length);
    expect(countCharacters('Hello 👋 World')).toBe('Hello 👋 World'.length);
  });

  it('handles mixed content with URLs and text', () => {
    const text = 'Hey @user check https://example.com/article and #fediverse https://another.link/path';
    // "Hey @user check " (16) + URL (23) + " and #fediverse " (16) + URL (23) = 78
    expect(countCharacters(text)).toBe(78);
  });
});

describe('countReplyCharacters', () => {
  it('excludes the leading @mention prefix from count', () => {
    const text = '@user@mastodon.social Hello!';
    expect(countReplyCharacters(text, 'user@mastodon.social')).toBe(6); // "Hello!"
  });

  it('does not exclude if prefix is not at the start', () => {
    const text = 'Hey @user@mastodon.social';
    expect(countReplyCharacters(text, 'user@mastodon.social')).toBe(text.length);
  });

  it('does not exclude if acct does not match', () => {
    const text = '@other@instance.social Hello!';
    expect(countReplyCharacters(text, 'user@mastodon.social')).toBe(text.length);
  });

  it('handles URL in reply text after excluded mention', () => {
    const text = '@user@mastodon.social Check https://example.com';
    // Excluded: "@user@mastodon.social " (22 chars)
    // Remaining: "Check https://example.com" = "Check " (6) + URL (23) = 29
    expect(countReplyCharacters(text, 'user@mastodon.social')).toBe(29);
  });

  it('handles empty text after mention', () => {
    const text = '@user@mastodon.social ';
    expect(countReplyCharacters(text, 'user@mastodon.social')).toBe(0);
  });

  it('handles short acct (no instance)', () => {
    const text = '@user Hello!';
    expect(countReplyCharacters(text, 'user')).toBe(6);
  });
});

describe('hASHTAG_RE', () => {
  function findHashtags(text: string): string[] {
    HASHTAG_RE.lastIndex = 0;
    const matches: string[] = [];
    let m = HASHTAG_RE.exec(text);
    while (m !== null) {
      matches.push(m[1]!);
      m = HASHTAG_RE.exec(text);
    }
    return matches;
  }

  it('matches hashtags', () => {
    expect(findHashtags('#hello')).toEqual(['#hello']);
    expect(findHashtags('text #hello world')).toEqual(['#hello']);
  });

  it('matches multiple hashtags', () => {
    expect(findHashtags('#one #two #three')).toEqual(['#one', '#two', '#three']);
  });

  it('matches numeric hashtags', () => {
    expect(findHashtags('#123')).toEqual(['#123']);
  });

  it('does not match bare #', () => {
    expect(findHashtags('# alone')).toEqual([]);
  });
});

describe('mENTION_RE', () => {
  function findMentions(text: string): string[] {
    MENTION_RE.lastIndex = 0;
    const matches: string[] = [];
    let m = MENTION_RE.exec(text);
    while (m !== null) {
      matches.push(m[1]!);
      m = MENTION_RE.exec(text);
    }
    return matches;
  }

  it('matches simple mentions', () => {
    expect(findMentions('@user')).toEqual(['@user']);
  });

  it('matches full acct mentions', () => {
    expect(findMentions('@user@instance.social')).toEqual(['@user@instance.social']);
  });

  it('matches mentions with dots in username', () => {
    expect(findMentions('@user.name@sub.domain.example')).toEqual(['@user.name@sub.domain.example']);
  });

  it('matches mentions after space', () => {
    expect(findMentions('hey @user check this')).toEqual(['@user']);
  });

  it('does not match bare @', () => {
    expect(findMentions('@ alone')).toEqual([]);
  });
});
