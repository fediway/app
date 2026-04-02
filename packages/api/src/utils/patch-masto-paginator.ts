// masto.js PaginatorHttp.getLink() calls `new URL(relativePath)` without a base,
// which throws on servers returning relative URLs in Link headers.
// Wraps URL constructor to resolve `/`-prefixed paths against a dummy base.
// Safe because the paginator only reads .pathname and .search, never the origin.

let patched = false;

export function patchRelativeLinkHeaders() {
  if (patched || typeof globalThis.URL !== 'function')
    return;
  patched = true;

  const OriginalURL = globalThis.URL;

  globalThis.URL = new Proxy(OriginalURL, {
    construct(target, args, newTarget) {
      const [input, base] = args as [string, string?];
      if (typeof input === 'string' && input.startsWith('/') && base === undefined) {
        return Reflect.construct(target, [input, 'http://localhost'], newTarget);
      }
      return Reflect.construct(target, args, newTarget);
    },
  }) as typeof URL;
}
