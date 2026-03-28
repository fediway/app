/**
 * Character counting utilities for Mastodon-compatible post composition.
 *
 * Mastodon rules:
 * - Each URL counts as 23 characters regardless of actual length
 * - Leading @mention in replies is excluded from the count
 */

export const URL_RE = /https?:\/\/\S+/g;
export const URL_CHAR_COUNT = 23;

/** Regex for detecting #hashtags in plain text */
export const HASHTAG_RE = /(?:^|\s)(#\w+)/g;

/** Regex for detecting @mentions in plain text */
export const MENTION_RE = /(?:^|\s)(@[\w.]+(?:@[\w.-]+)?)/g;

/**
 * Count characters with Mastodon URL rules.
 * Each URL (http:// or https://) counts as 23 characters.
 */
export function countCharacters(text: string): number {
  return text.replace(URL_RE, 'x'.repeat(URL_CHAR_COUNT)).length;
}

/**
 * Count characters for a reply, excluding the leading @mention prefix.
 * Mastodon doesn't count the auto-prepended @mention toward the character limit.
 */
export function countReplyCharacters(text: string, replyToAcct: string): number {
  const prefix = `@${replyToAcct} `;
  const content = text.startsWith(prefix) ? text.slice(prefix.length) : text;
  return countCharacters(content);
}
