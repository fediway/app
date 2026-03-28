import { FediwayAPIError, FediwayNetworkError } from '../errors';

const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_RETRIES = 2;
const RETRY_BASE_DELAY = 500;
const MAX_RATE_LIMIT_WAIT = 30_000; // Don't wait more than 30s for rate limits

let on401Handler: (() => void) | null = null;

export function setOn401Handler(handler: (() => void) | null): void {
  on401Handler = handler;
}

export interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
  timeout?: number;
  /** Number of retries on network errors. Defaults to 2. Set to 0 to disable. */
  retries?: number;
  /** Base delay between retries in ms. Doubles each attempt (exponential backoff). Defaults to 500. */
  retryDelay?: number;
  /** Number of 429 retries remaining (internal — don't set manually) */
  rateLimitRetries?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

type FetchResult
  = { ok: true; response: Response }
    | { ok: false; error: unknown };

export async function request<T>(url: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, timeout = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES, retryDelay = RETRY_BASE_DELAY } = opts;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const baseFetchOpts: RequestInit = {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  let lastError: FediwayNetworkError | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0 && lastError) {
      await sleep(retryDelay * (2 ** (attempt - 1)));
    }

    // Use .then(ok, err) instead of try/catch to register the rejection handler
    // synchronously — avoids spurious "unhandled rejection" in test environments
    // with fake timers.
    const result: FetchResult = await fetch(url, {
      ...baseFetchOpts,
      signal: AbortSignal.timeout(timeout),
    }).then(
      response => ({ ok: true as const, response }),
      error => ({ ok: false as const, error }),
    );

    if (!result.ok) {
      const err = result.error;
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        lastError = new FediwayNetworkError('Request timed out', err);
      }
      else {
        lastError = new FediwayNetworkError('Network request failed', err);
      }
      // Retry on network errors
      continue;
    }

    const { response } = result;

    if (!response.ok) {
      let errorData: { error?: string; error_description?: string } = {};
      try {
        errorData = await response.json();
      }
      catch {
        // Response body wasn't JSON — use status text
      }

      // Rate limited (429) — wait and retry transparently (separate from network retries)
      const rateLimitRetries = opts.rateLimitRetries ?? 2;
      if (response.status === 429 && rateLimitRetries > 0) {
        const retryAfter = response.headers.get('Retry-After');
        const waitMs = retryAfter
          ? Math.min(Number.parseInt(retryAfter, 10) * 1000 || 5000, MAX_RATE_LIMIT_WAIT)
          : 5000;
        await sleep(waitMs);
        return request<T>(url, { ...opts, retries: 0, rateLimitRetries: rateLimitRetries - 1 });
      }

      const apiError = new FediwayAPIError({
        status: response.status,
        message: errorData.error_description ?? errorData.error ?? response.statusText,
      });

      if (apiError.isUnauthorized && on401Handler) {
        on401Handler();
      }

      // Other API errors are not retried — the server gave a definitive response
      throw apiError;
    }

    // 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    try {
      return await response.json() as T;
    }
    catch {
      throw new FediwayAPIError({
        status: response.status,
        message: 'Invalid JSON in response',
      });
    }
  }

  // All retries exhausted — throw the last network error
  // eslint-disable-next-line no-throw-literal -- lastError is always set when retries > 0
  throw lastError as FediwayNetworkError;
}
