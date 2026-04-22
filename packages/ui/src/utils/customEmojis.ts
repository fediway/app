import type { CustomEmoji } from '@repo/types';
import { escapeRegExp, sanitizeHtml, stripUnresolvedEmojiShortcodes } from './sanitize';

const ATTR_ESCAPE_RE = /[&<>"']/g;
const ATTR_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;',
};

function escapeHtmlAttr(str: string): string {
  return str.replace(ATTR_ESCAPE_RE, c => ATTR_ESCAPE_MAP[c]!);
}

const URL_QUOTE_RE = /"/g;

const DEFAULT_IMG_CLASS = 'inline-block h-5 w-5 align-text-bottom';

/**
 * Render Mastodon-style custom emoji shortcodes into inline `<img>` tags.
 *
 * Pipeline:
 * 1. Sanitize the input HTML (idempotent; safe even for plain text).
 * 2. Dedupe emojis by shortcode (first-wins). Prevents a later duplicate's
 *    regex from matching inside an earlier substitution's `alt` attribute.
 * 3. Substitute each resolved shortcode with an img tag. The alt attribute
 *    is HTML-escaped, not regex-escaped, so a shortcode containing `"` or
 *    `<` cannot break out of the attribute.
 * 4. Strip any remaining `:shortcode:` patterns (unresolved → ugly text).
 */
export function renderCustomEmojis(
  html: string,
  emojis: readonly CustomEmoji[] = [],
  imgClass: string = DEFAULT_IMG_CLASS,
): string {
  let result = sanitizeHtml(html);

  const seen = new Set<string>();
  for (const emoji of emojis) {
    if (seen.has(emoji.shortcode))
      continue;
    seen.add(emoji.shortcode);

    const pattern = new RegExp(`:${escapeRegExp(emoji.shortcode)}:`, 'g');
    const src = encodeURI(emoji.url).replace(URL_QUOTE_RE, '%22');
    const alt = escapeHtmlAttr(`:${emoji.shortcode}:`);
    const imgTag = `<img loading="lazy" decoding="async" src="${src}" alt="${alt}" class="${imgClass}" draggable="false" />`;
    result = result.replace(pattern, imgTag);
  }

  return stripUnresolvedEmojiShortcodes(result);
}
