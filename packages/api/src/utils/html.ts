/**
 * Shared HTML utilities for processing Mastodon status content.
 * Used by data composables (conversations, posts) and the mock client.
 */

const HTML_TAG_RE = /<[^>]*>/g;
const HTML_ENTITY_RE = /&([a-z]+|#\d+|#x[\da-f]+);/gi;
const AMP_RE = /&/g;
const LT_RE = /</g;
const GT_RE = />/g;
const NEWLINE_RE = /\n/g;
const LEADING_MENTION_RE = /^@([\w.@-]+)\s*/;

const ENTITY_MAP: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: '\'',
  nbsp: ' ',
};

function decodeEntity(_match: string, entity: string): string {
  if (ENTITY_MAP[entity])
    return ENTITY_MAP[entity];
  if (entity.startsWith('#x'))
    return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
  if (entity.startsWith('#'))
    return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
  return _match;
}

/** Strip HTML tags and decode entities. Returns plain text. */
export function stripHtml(html: string): string {
  return html.replace(HTML_TAG_RE, '').replace(HTML_ENTITY_RE, decodeEntity).trim();
}

/** Escape text for safe embedding in HTML. */
export function escapeHtml(text: string): string {
  return text
    .replace(AMP_RE, '&amp;')
    .replace(LT_RE, '&lt;')
    .replace(GT_RE, '&gt;')
    .replace(NEWLINE_RE, '<br>');
}

/**
 * Clean a DM status for chat display:
 * 1. Strip HTML tags + decode entities
 * 2. Remove leading @mentions that are conversation participants (routing, not content)
 *
 * @param html - Raw HTML content from a Status
 * @param participantAccts - Accts of all conversation participants (used to strip routing mentions)
 */
export function formatMessageContent(html: string, participantAccts: string[]): string {
  let text = stripHtml(html);

  const acctSet = new Set<string>();
  for (const acct of participantAccts) {
    acctSet.add(acct.toLowerCase());
    const localPart = acct.split('@')[0];
    if (localPart)
      acctSet.add(localPart.toLowerCase());
  }

  let match = LEADING_MENTION_RE.exec(text);
  while (match) {
    const mentioned = match[1]!.toLowerCase();
    if (!acctSet.has(mentioned))
      break;
    text = text.slice(match[0].length);
    match = LEADING_MENTION_RE.exec(text);
  }

  return text.trim();
}
