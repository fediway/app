// @vitest-environment happy-dom
import type { CustomEmoji } from '@repo/types';
import { describe, expect, it } from 'vitest';
import { renderCustomEmojis } from '../customEmojis';

function emoji(shortcode: string, url = `https://cdn.example/${shortcode}.png`): CustomEmoji {
  return { shortcode, url, staticUrl: url, visibleInPicker: true } as CustomEmoji;
}

describe('renderCustomEmojis', () => {
  it('replaces a resolved shortcode with an img tag', () => {
    const out = renderCustomEmojis('hello :wave:', [emoji('wave')]);
    expect(out).toContain('<img');
    expect(out).toContain('src="https://cdn.example/wave.png"');
    expect(out).toContain('alt=":wave:"');
    expect(out).not.toContain(':wave:</'); // no leftover text shortcode
  });

  it('strips unresolved shortcodes so they do not leak as raw text', () => {
    const out = renderCustomEmojis('hi :ghost: there', []);
    expect(out).not.toContain(':ghost:');
    expect(out).toContain('hi ');
    expect(out).toContain(' there');
  });

  it('leaves timestamp-like patterns intact (first char must be letter/_)', () => {
    const out = renderCustomEmojis('start 12:30:45 end', []);
    expect(out).toContain('12:30:45');
  });

  it('dedupes emojis by shortcode — first wins, no corruption', () => {
    const dupes = [emoji('foo', 'https://a/1.png'), emoji('foo', 'https://b/2.png')];
    const out = renderCustomEmojis(':foo:', dupes);
    const imgMatches = out.match(/<img[^>]*>/g) ?? [];
    expect(imgMatches).toHaveLength(1);
    expect(imgMatches[0]).toContain('https://a/1.png');
    expect(imgMatches[0]).not.toContain('https://b/2.png');
  });

  it('html-escapes the alt attribute so a quote in a shortcode cannot break out', () => {
    // Theoretical: Mastodon rejects such shortcodes, but the renderer defends anyway.
    const malicious = emoji('foo"bar');
    const out = renderCustomEmojis(':foo"bar:', [malicious]);
    expect(out).toContain('alt=":foo&quot;bar:"');
    expect(out).not.toMatch(/alt=":foo"bar:"/);
  });

  it('handles empty input and empty emojis', () => {
    expect(renderCustomEmojis('', [])).toBe('');
    expect(renderCustomEmojis('plain text', [])).toContain('plain text');
  });

  it('does not strip shortcode-looking text inside an img alt it just produced', () => {
    const out = renderCustomEmojis(':wave: again', [emoji('wave')]);
    expect(out).toContain('alt=":wave:"');
    expect(out).toContain(' again');
  });

  it('is safe against ReDoS-style shortcodes via escapeRegExp', () => {
    const tricky = emoji('a.*b');
    const out = renderCustomEmojis(':a.*b:', [tricky]);
    expect(out).toContain('<img');
    expect(out).not.toContain(':a.*b:</'); // replaced, not leaked
  });

  it('accepts a custom imgClass for different size contexts', () => {
    const out = renderCustomEmojis(':wave:', [emoji('wave')], 'inline-block h-4 w-4');
    expect(out).toContain('class="inline-block h-4 w-4"');
  });
});
