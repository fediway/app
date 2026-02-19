import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FediwayAPIError, FediwayNetworkError } from '../../src/errors';
import { request, setOn401Handler } from '../../src/utils/request';

describe('request', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    setOn401Handler(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('successful requests', () => {
    it('makes a GET request and returns JSON', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: '1' }),
      });

      const result = await request<{ id: string }>('https://example.com/api/test');

      expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/test', expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Accept: 'application/json' }),
      }));
      expect(result).toEqual({ id: '1' });
    });

    it('returns undefined for 204 No Content', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      const result = await request('https://example.com/api/test', { method: 'DELETE' });
      expect(result).toBeUndefined();
    });
  });

  describe('authorization header', () => {
    it('includes Authorization header when token provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await request('https://example.com/api/test', { token: 'my-token' });

      expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      }));
    });

    it('omits Authorization header when no token', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await request('https://example.com/api/test');

      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders).not.toHaveProperty('Authorization');
    });
  });

  describe('request body', () => {
    it('serializes body as JSON for POST', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ ok: true }),
      });

      await request('https://example.com/api/test', {
        method: 'POST',
        body: { status: 'hello' },
      });

      expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ status: 'hello' }),
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }));
    });

    it('omits Content-Type when no body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await request('https://example.com/api/test');

      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders).not.toHaveProperty('Content-Type');
    });

    it('sends undefined body when not provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await request('https://example.com/api/test');

      expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        body: undefined,
      }));
    });
  });

  describe('timeout', () => {
    it('passes timeout signal to fetch', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await request('https://example.com/api/test', { timeout: 5000 });

      const callOpts = mockFetch.mock.calls[0][1];
      expect(callOpts.signal).toBeDefined();
    });

    it('throws FediwayNetworkError with "timed out" on TimeoutError', async () => {
      const timeoutError = new DOMException('Signal timed out', 'TimeoutError');
      mockFetch.mockRejectedValue(timeoutError);

      await expect(request('https://example.com/api/test', { retries: 0 }))
        .rejects
        .toThrow('Request timed out');

      try {
        await request('https://example.com/api/test', { retries: 0 });
      }
      catch (err) {
        expect(err).toBeInstanceOf(FediwayNetworkError);
        expect((err as FediwayNetworkError).cause).toBe(timeoutError);
      }
    });
  });

  describe('error handling', () => {
    it('throws FediwayAPIError on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Record not found' }),
      });

      try {
        await request('https://example.com/api/test');
        expect.fail('should have thrown');
      }
      catch (err) {
        expect(err).toBeInstanceOf(FediwayAPIError);
        expect((err as FediwayAPIError).status).toBe(404);
        expect((err as FediwayAPIError).message).toBe('Record not found');
      }
    });

    it('prefers error_description over error in response body', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: () => Promise.resolve({ error: 'validation_error', error_description: 'Status is too long' }),
      });

      await expect(request('https://example.com/api/test'))
        .rejects
        .toThrow('Status is too long');
    });

    it('uses error field when no error_description', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ error: 'Access denied' }),
      });

      await expect(request('https://example.com/api/test'))
        .rejects
        .toThrow('Access denied');
    });

    it('falls back to statusText when body is not JSON', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('not json')),
      });

      await expect(request('https://example.com/api/test'))
        .rejects
        .toThrow('Internal Server Error');
    });

    it('sets correct status on thrown FediwayAPIError', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: () => Promise.resolve({}),
      });

      try {
        await request('https://example.com/api/test');
        expect.fail('should have thrown');
      }
      catch (err) {
        expect(err).toBeInstanceOf(FediwayAPIError);
        expect((err as FediwayAPIError).status).toBe(503);
      }
    });

    it('throws FediwayNetworkError on fetch failure', async () => {
      const fetchError = new TypeError('Failed to fetch');
      mockFetch.mockRejectedValue(fetchError);

      try {
        await request('https://example.com/api/test', { retries: 0 });
        expect.fail('should have thrown');
      }
      catch (err) {
        expect(err).toBeInstanceOf(FediwayNetworkError);
        expect((err as FediwayNetworkError).cause).toBe(fetchError);
      }
    });

    it('does not retry on API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({}),
      });

      await expect(request('https://example.com/api/test', { retries: 2 }))
        .rejects
        .toThrow(FediwayAPIError);

      // API errors are never retried — fetch called exactly once
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('retry', () => {
    it('retries on network error and succeeds', async () => {
      const fetchError = new TypeError('Failed to fetch');
      mockFetch
        .mockRejectedValueOnce(fetchError)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ id: '1' }),
        });

      const result = await request<{ id: string }>('https://example.com/api/test', { retries: 1, retryDelay: 0 });

      expect(result).toEqual({ id: '1' });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('retries on timeout and succeeds', async () => {
      const timeoutError = new DOMException('Signal timed out', 'TimeoutError');
      mockFetch
        .mockRejectedValueOnce(timeoutError)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ ok: true }),
        });

      const result = await request('https://example.com/api/test', { retries: 1, retryDelay: 0 });

      expect(result).toEqual({ ok: true });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('exhausts all retries and throws last error', async () => {
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(request('https://example.com/api/test', { retries: 2, retryDelay: 0 }))
        .rejects
        .toThrow(FediwayNetworkError);
      // 1 initial + 2 retries = 3 total
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('does not retry when retries is 0', async () => {
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(request('https://example.com/api/test', { retries: 0 }))
        .rejects
        .toThrow(FediwayNetworkError);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('uses exponential backoff between retries', async () => {
      const callTimes: number[] = [];
      mockFetch.mockImplementation(() => {
        callTimes.push(performance.now());
        return Promise.reject(new TypeError('Failed to fetch'));
      });

      // Use small delay (10ms base) so the test runs fast but timing is measurable
      await expect(request('https://example.com/api/test', { retries: 2, retryDelay: 10 }))
        .rejects
        .toThrow(FediwayNetworkError);

      expect(callTimes).toHaveLength(3);
      // First retry delay: ~10ms (base * 2^0)
      expect(callTimes[1]! - callTimes[0]!).toBeGreaterThanOrEqual(8);
      // Second retry delay: ~20ms (base * 2^1)
      expect(callTimes[2]! - callTimes[1]!).toBeGreaterThanOrEqual(16);
    });

    it('succeeds on second retry after two failures', async () => {
      const fetchError = new TypeError('Failed to fetch');
      mockFetch
        .mockRejectedValueOnce(fetchError)
        .mockRejectedValueOnce(fetchError)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ recovered: true }),
        });

      const result = await request('https://example.com/api/test', { retries: 2, retryDelay: 0 });

      expect(result).toEqual({ recovered: true });
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('401 handler', () => {
    it('calls 401 handler on unauthorized response', async () => {
      const handler = vi.fn();
      setOn401Handler(handler);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: 'Token revoked' }),
      });

      await expect(request('https://example.com/api/test'))
        .rejects
        .toThrow(FediwayAPIError);
      expect(handler).toHaveBeenCalledOnce();
    });

    it('does not call 401 handler for non-401 errors', async () => {
      const handler = vi.fn();
      setOn401Handler(handler);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ error: 'Forbidden' }),
      });

      await expect(request('https://example.com/api/test'))
        .rejects
        .toThrow(FediwayAPIError);
      expect(handler).not.toHaveBeenCalled();
    });

    it('does not call 401 handler when no handler set', async () => {
      // setOn401Handler(null) is already called in beforeEach
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({}),
      });

      // Should still throw, just not call a handler
      await expect(request('https://example.com/api/test'))
        .rejects
        .toThrow(FediwayAPIError);
    });

    it('still throws after calling 401 handler', async () => {
      const handler = vi.fn();
      setOn401Handler(handler);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({}),
      });

      await expect(request('https://example.com/api/test'))
        .rejects
        .toThrow(FediwayAPIError);
    });
  });
});
