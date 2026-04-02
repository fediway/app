// masto.js PaginatorHttp.getLink() calls `new URL(relativePath)` without a base,
// which throws on servers returning relative URLs in Link headers.
// Wraps URL constructor to resolve `/`-prefixed paths against a dummy base.
// Safe because the paginator only reads .pathname and .search, never the origin.

const OriginalURL = globalThis.URL;

const PatchedURL = new Proxy(OriginalURL, {
  construct(target, args, newTarget) {
    const [input, base] = args as [string, string?];
    if (typeof input === 'string' && input.startsWith('/') && base === undefined) {
      return Reflect.construct(target, [input, 'http://localhost'], newTarget);
    }
    return Reflect.construct(target, args, newTarget);
  },
});

let patched = false;

export function patchRelativeLinkHeaders() {
  if (patched)
    return;
  patched = true;
  globalThis.URL = PatchedURL as typeof URL;
}
