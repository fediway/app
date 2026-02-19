import { createRestAPIClient } from 'masto';

export interface InstanceInfo {
  domain: string;
  version: string;
  streamingUrl: string;
  maxChars: number;
}

const MIN_VERSION = '4.3.0';

/**
 * Normalize user input to a clean instance URL.
 * Strips protocol, trailing slash, lowercases, prepends https.
 */
export function normalizeInstanceUrl(input: string): string {
  let domain = input.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//, '');
  domain = domain.replace(/\/+$/, '');
  // Remove any path segments — we just want the domain
  domain = domain.split('/')[0]!;
  return `https://${domain}`;
}

function parseVersion(version: string): number[] {
  // Handle versions like "4.3.0-alpha.1+glitch" — take only the semver part
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match)
    return [0, 0, 0];
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function isVersionAtLeast(version: string, minimum: string): boolean {
  const [majA = 0, minA = 0, patchA = 0] = parseVersion(version);
  const [majB = 0, minB = 0, patchB = 0] = parseVersion(minimum);
  if (majA !== majB)
    return majA > majB;
  if (minA !== minB)
    return minA > minB;
  return patchA >= patchB;
}

/**
 * Discover instance info by calling /api/v2/instance.
 * Throws if unreachable or version is too old.
 */
export async function discoverInstance(url: string): Promise<InstanceInfo> {
  const rest = createRestAPIClient({ url });
  const instance = await rest.v2.instance.fetch();

  const version = instance.version;
  if (!isVersionAtLeast(version, MIN_VERSION)) {
    throw new Error(`Instance version ${version} is too old (minimum: ${MIN_VERSION})`);
  }

  return {
    domain: instance.domain,
    version,
    streamingUrl: instance.configuration?.urls?.streaming ?? `${url}/api/v1/streaming`,
    maxChars: instance.configuration?.statuses?.maxCharacters ?? 500,
  };
}
