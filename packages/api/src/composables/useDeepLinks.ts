/** Parsed deep link route ready for Vue Router navigation */
export interface DeepLinkRoute {
  path: string;
  query?: Record<string, string>;
}

export interface UseDeepLinksReturn {
  resolveUrl: (url: string) => DeepLinkRoute | null;
  isCapturePath: (pathname: string) => boolean;
  isExcludedPath: (pathname: string) => boolean;
}

/** Paths the app handles natively — require content after the prefix */
const CAPTURE_PATTERNS = [
  /^\/@.+/, // /@username, /@username/123
  /^\/items\/.+/, // /items/https://example.com
  /^\/tags\/.+/, // /tags/music
];

/** Paths that must stay in the browser / not be intercepted */
const EXCLUDE_PATTERNS = [
  /^\/settings(\/|$)/, // /settings, /settings/notifications
  /^\/auth(\/|$)/, // /auth, /auth/login
  /^\/oauth(\/|$)/, // /oauth, /oauth/callback
];

/**
 * Pure URL parsing for deep links — no Capacitor imports, no Vue Router imports.
 *
 * The composable provides the logic — the consumer wires platform events:
 * - Native: `App.addListener('appUrlOpen', (data) => { ... })`
 *
 * No domain checking — the native layer (AASA / intent filters) handles that.
 */
export function useDeepLinks(): UseDeepLinksReturn {
  function isExcludedPath(pathname: string): boolean {
    return EXCLUDE_PATTERNS.some(re => re.test(pathname));
  }

  function isCapturePath(pathname: string): boolean {
    return CAPTURE_PATTERNS.some(re => re.test(pathname));
  }

  function resolveUrl(url: string): DeepLinkRoute | null {
    let parsed: URL;
    try {
      parsed = new URL(url);
    }
    catch {
      return null;
    }

    const { pathname, searchParams } = parsed;

    // Excludes take priority
    if (isExcludedPath(pathname)) {
      return null;
    }

    if (!isCapturePath(pathname)) {
      return null;
    }

    // Build query object only if there are search params
    const query: Record<string, string> = {};
    let hasQuery = false;
    searchParams.forEach((value, key) => {
      query[key] = value;
      hasQuery = true;
    });

    return {
      path: pathname,
      ...(hasQuery ? { query } : {}),
    };
  }

  return {
    /** Resolve a deep link URL to a Vue Router route, or null if not handled */
    resolveUrl,
    /** Check if a pathname matches a capture pattern */
    isCapturePath,
    /** Check if a pathname matches an exclude pattern */
    isExcludedPath,
  };
}
