import { describe, expect, it } from 'vitest';
import { escapeHtml, formatMessageContent, stripHtml } from '../../src/utils/html';

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
  });

  it('decodes named HTML entities', () => {
    expect(stripHtml('Tom &amp; Jerry')).toBe('Tom & Jerry');
    expect(stripHtml('&lt;script&gt;')).toBe('<script>');
    expect(stripHtml('She said &quot;hello&quot;')).toBe('She said "hello"');
  });

  it('decodes numeric HTML entities', () => {
    expect(stripHtml('&#39;quotes&#39;')).toBe('\'quotes\'');
    expect(stripHtml('&#x27;hex&#x27;')).toBe('\'hex\'');
  });

  it('handles tags + entities together', () => {
    expect(stripHtml('<p>Tom &amp; Jerry &lt;3</p>')).toBe('Tom & Jerry <3');
  });

  it('handles empty string', () => {
    expect(stripHtml('')).toBe('');
  });

  it('returns plain text unchanged', () => {
    expect(stripHtml('No HTML here')).toBe('No HTML here');
  });

  it('trims whitespace', () => {
    expect(stripHtml('  <p>hello</p>  ')).toBe('hello');
  });
});

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('A & B')).toBe('A &amp; B');
  });

  it('escapes angle brackets', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('converts newlines to <br>', () => {
    expect(escapeHtml('Line 1\nLine 2')).toBe('Line 1<br>Line 2');
  });

  it('escapes all special chars together', () => {
    expect(escapeHtml('A & B < C > D\nE')).toBe('A &amp; B &lt; C &gt; D<br>E');
  });

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('returns safe text unchanged', () => {
    expect(escapeHtml('Hello world')).toBe('Hello world');
  });
});

describe('formatMessageContent', () => {
  it('strips leading participant mention from DM', () => {
    expect(formatMessageContent(
      '<p>@alice@example.com Sure, let\'s chat.</p>',
      ['alice@example.com'],
    )).toBe('Sure, let\'s chat.');
  });

  it('strips short-form mention (local part only)', () => {
    expect(formatMessageContent(
      '<p>@alice Sure, let\'s chat.</p>',
      ['alice@example.com'],
    )).toBe('Sure, let\'s chat.');
  });

  it('strips multiple leading participant mentions in group DM', () => {
    expect(formatMessageContent(
      '<p>@alice @bob Hey both of you!</p>',
      ['alice@example.com', 'bob@example.com'],
    )).toBe('Hey both of you!');
  });

  it('preserves non-participant mentions at the start', () => {
    expect(formatMessageContent(
      '<p>@charlie Have you seen this?</p>',
      ['alice@example.com'],
    )).toBe('@charlie Have you seen this?');
  });

  it('preserves participant mentions mid-message', () => {
    expect(formatMessageContent(
      '<p>I agree with @alice on this</p>',
      ['alice@example.com'],
    )).toBe('I agree with @alice on this');
  });

  it('handles message that is only a mention', () => {
    expect(formatMessageContent(
      '<p>@alice@example.com</p>',
      ['alice@example.com'],
    )).toBe('');
  });

  it('handles Mastodon HTML mention markup', () => {
    const html = '<p><span class="h-card"><a href="https://example.com/@alice" class="u-url mention">@<span>alice</span></a></span> Sure, let\'s chat.</p>';
    expect(formatMessageContent(html, ['alice@example.com'])).toBe('Sure, let\'s chat.');
  });

  it('decodes entities after stripping mentions', () => {
    expect(formatMessageContent(
      '<p>@alice Tom &amp; Jerry</p>',
      ['alice@example.com'],
    )).toBe('Tom & Jerry');
  });

  it('works with empty participant list', () => {
    expect(formatMessageContent(
      '<p>@alice Hello</p>',
      [],
    )).toBe('@alice Hello');
  });
});
