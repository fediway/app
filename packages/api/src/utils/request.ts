import { FediwayAPIError, FediwayNetworkError } from '../errors';

const DEFAULT_TIMEOUT = 30_000;

let on401Handler: (() => void) | null = null;

export function setOn401Handler(handler: (() => void) | null): void {
  on401Handler = handler;
}

export interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
  timeout?: number;
}

export async function request<T>(url: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, timeout = DEFAULT_TIMEOUT } = opts;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeout),
    });
  }
  catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new FediwayNetworkError('Request timed out', err);
    }
    throw new FediwayNetworkError('Network request failed', err);
  }

  if (!response.ok) {
    let errorData: { error?: string; error_description?: string } = {};
    try {
      errorData = await response.json();
    }
    catch {
      // Response body wasn't JSON — use status text
    }

    const apiError = new FediwayAPIError({
      status: response.status,
      message: errorData.error_description ?? errorData.error ?? response.statusText,
    });

    if (apiError.isUnauthorized && on401Handler) {
      on401Handler();
    }

    throw apiError;
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
