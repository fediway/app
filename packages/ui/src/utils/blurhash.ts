import { decode } from 'blurhash';

const cache = new Map<string, string>();

// Valid blurhash characters (base 83 encoding)
const BLURHASH_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~';

/**
 * Check if a string is a valid blurhash.
 * Validates length (6+ chars) and character set (base-83).
 */
export function isBlurhashValid(hash: string): boolean {
  if (!hash || hash.length < 6)
    return false;
  for (const char of hash) {
    if (!BLURHASH_CHARS.includes(char))
      return false;
  }
  return true;
}

/**
 * Get a CSS background style for a blurhash placeholder.
 * Returns empty object if blurhash is invalid or missing.
 */
export function blurhashStyle(hash: string | undefined | null): Record<string, string> {
  if (!hash || !isBlurhashValid(hash))
    return {};
  try {
    const dataUrl = decodeBlurhash(hash, 32, 32);
    return { backgroundImage: `url(${dataUrl})`, backgroundSize: 'cover' };
  }
  catch {
    return {};
  }
}

/**
 * Decode a blurhash string into a data URL.
 * Results are cached to avoid re-decoding the same hash.
 */
export function decodeBlurhash(hash: string, width = 32, height = 32): string {
  const cacheKey = `${hash}:${width}:${height}`;
  const cached = cache.get(cacheKey);
  if (cached)
    return cached;

  const pixels = decode(hash, width, height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx)
    throw new Error('Failed to get canvas 2d context');

  const imageData = ctx.createImageData(width, height);
  imageData.data.set(pixels);
  ctx.putImageData(imageData, 0, 0);

  const dataUrl = canvas.toDataURL();
  cache.set(cacheKey, dataUrl);
  return dataUrl;
}
