/**
 * URL path builders for Mastodon entities.
 * Shared between web and mobile for consistent routing.
 */

const LEADING_AT_RE = /^@/;

/** Build profile path: /@acct */
export function getProfilePath(acct: string): string {
  const cleanAcct = acct.replace(LEADING_AT_RE, '');
  return `/@${cleanAcct}`;
}

/** Build status path: /@acct/statusId */
export function getStatusPath(acct: string, statusId: string): string {
  return `${getProfilePath(acct)}/${statusId}`;
}
