// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { escapeRegExp, sanitizeHtml } from '../../src/utils/sanitize';

describe('sanitizeHtml', () => {
  it('strips script tags', () => {
    expect(sanitizeHtml('<p>hello</p><script>alert("xss")</script>'))
      .toBe('<p>hello</p>');
  });

  it('strips javascript: hrefs', () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    expect(sanitizeHtml(input)).toBe('<a>click</a>');
  });

  it('strips event handlers', () => {
    expect(sanitizeHtml('<img src="x" onerror="alert(1)" />'))
      .toBe('<img src="x">');
    expect(sanitizeHtml('<p onclick="alert(1)">text</p>'))
      .toBe('<p>text</p>');
  });

  it('preserves allowed Mastodon HTML', () => {
    const input = '<p>Hello <a href="https://example.com" rel="nofollow" target="_blank">link</a></p><br><span class="mention">@user</span>';
    expect(sanitizeHtml(input)).toBe(input);
  });

  it('preserves img tags for custom emoji', () => {
    const input = '<img src="https://instance.social/emoji/blob.png" alt=":blob:" class="inline-block h-5 w-5" draggable="false">';
    expect(sanitizeHtml(input)).toBe(input);
  });

  it('strips data-* attributes', () => {
    expect(sanitizeHtml('<span data-evil="payload" class="ok">text</span>'))
      .toBe('<span class="ok">text</span>');
  });

  it('handles empty string', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('handles plain text (no HTML)', () => {
    expect(sanitizeHtml('just plain text')).toBe('just plain text');
  });

  it('strips style tags', () => {
    expect(sanitizeHtml('<style>body{display:none}</style><p>text</p>'))
      .toBe('<p>text</p>');
  });

  it('strips iframe tags', () => {
    expect(sanitizeHtml('<iframe src="https://evil.com"></iframe><p>text</p>'))
      .toBe('<p>text</p>');
  });
});

describe('escapeRegExp', () => {
  it('escapes regex special characters', () => {
    expect(escapeRegExp('a.b*c+d?e')).toBe('a\\.b\\*c\\+d\\?e');
  });

  it('leaves normal strings unchanged', () => {
    expect(escapeRegExp('blobcat')).toBe('blobcat');
  });

  it('escapes brackets and parens', () => {
    expect(escapeRegExp('a[b](c){d}')).toBe('a\\[b\\]\\(c\\)\\{d\\}');
  });
});
