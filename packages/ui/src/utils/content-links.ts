/**
 * Utilities for parsing Mastodon API content links (mentions, hashtags).
 *
 * Mastodon returns HTML with <a> tags for mentions and hashtags.
 * These utilities extract structured data from those links so the
 * consuming app can handle navigation (SPA routing, not page refresh).
 */

/** Matches: https://instance/@user or https://instance/@user@other */
const MENTION_URL_RE = /^https?:\/\/([^/]+)\/@([^/]+)\/?$/;

/** Matches: https://instance/tags/name or https://instance/tag/name */
const TAG_URL_RE = /^https?:\/\/[^/]+\/tags?\/([^/]+)\/?$/;

export interface StatusMention {
  id: string;
  username: string;
  acct: string;
  url: string;
}

/**
 * Resolve a mention link to a fully-qualified acct (user or user@domain).
 *
 * Resolution order (most reliable first):
 * 1. Match href against status.mentions by URL
 * 2. Match link text against status.mentions by username/acct
 * 3. Parse the URL directly to extract user@domain
 *
 * Returns null if the link cannot be resolved as a mention.
 */
export function resolveMentionAcct(
  href: string,
  linkText: string,
  mentions: StatusMention[],
): string | null {
  if (!href)
    return null;

  // Normalize trailing slash for comparison
  const normalizedHref = href.replace(/\/$/, '');

  // 1. Match by URL (most reliable — server provides canonical URL)
  const byUrl = mentions.find(m => m.url.replace(/\/$/, '') === normalizedHref);
  if (byUrl)
    return byUrl.acct;

  // 2. Match by username from link text
  const username = linkText.replace(/^@/, '').trim();
  if (username) {
    const byAcct = mentions.find(m => m.acct === username);
    if (byAcct)
      return byAcct.acct;

    const byUsername = mentions.find(m => m.username === username);
    if (byUsername)
      return byUsername.acct;
  }

  // 3. Parse the URL directly
  const match = href.match(MENTION_URL_RE);
  if (match) {
    const [, domain, user] = match;
    return user!.includes('@') ? user! : `${user}@${domain}`;
  }

  return null;
}

/**
 * Extract a hashtag name from a hashtag link.
 *
 * Resolution order:
 * 1. Parse the URL (/tags/name or /tag/name)
 * 2. Fall back to link text (strip leading #)
 *
 * Returns null if the tag cannot be extracted.
 */
export function extractTagName(
  href: string,
  linkText: string,
): string | null {
  // 1. Parse URL pattern
  const match = href.match(TAG_URL_RE);
  if (match)
    return match[1]!.toLowerCase();

  // 2. Fall back to link text
  const text = linkText.replace(/^#/, '').trim();
  return text || null;
}
