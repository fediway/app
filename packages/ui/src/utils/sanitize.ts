import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'p',
  'br',
  'span',
  'a',
  'strong',
  'em',
  'b',
  'i',
  'u',
  'del',
  'pre',
  'code',
  'blockquote',
  'ul',
  'ol',
  'li',
  'img',
];

const ALLOWED_ATTR = [
  'href',
  'rel',
  'target',
  'class',
  'src',
  'alt',
  'draggable',
  'title',
];

/**
 * Sanitize HTML content from Mastodon API before rendering with v-html.
 * Strips everything except the tags and attributes Mastodon actually uses.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Escape a string for safe use in a RegExp constructor.
 * Prevents ReDoS from malicious emoji shortcodes.
 */
const SPECIAL_CHARS_RE = /[.*+?^${}()|[\]\\]/g;

export function escapeRegExp(str: string): string {
  return str.replace(SPECIAL_CHARS_RE, '\\$&');
}

const UNRESOLVED_SHORTCODE_RE = /(<[^>]*>)|:[a-z_]\w*:/gi;

/**
 * Strip `:shortcode:` patterns that weren't replaced by custom-emoji images.
 * Matches only outside HTML tags so we don't touch `alt=":foo:"` attributes on
 * img tags produced by emoji substitution. Requires a letter or underscore as
 * the first char so timestamps like `12:30:45` stay intact.
 */
export function stripUnresolvedEmojiShortcodes(html: string): string {
  return html.replace(UNRESOLVED_SHORTCODE_RE, (_, tag) => tag ?? '');
}
