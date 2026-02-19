import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFediwayAPI } from '../src/fediway-api';
import { request } from '../src/utils/request';

// Mock request.ts to avoid real network calls
vi.mock('../src/utils/request', () => ({
  request: vi.fn(),
}));

const mockedRequest = vi.mocked(request);

describe('createFediwayAPI', () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createStatus', () => {
    it('posts to /api/fediway/v1/statuses', async () => {
      const mockStatus = { id: '1', content: 'test' };
      mockedRequest.mockResolvedValue(mockStatus);

      const api = createFediwayAPI('https://fediway.com', () => 'my-token');
      const result = await api.createStatus({ status: 'hello' });

      expect(mockedRequest).toHaveBeenCalledWith(
        'https://fediway.com/api/fediway/v1/statuses',
        expect.objectContaining({
          method: 'POST',
          body: { status: 'hello' },
          token: 'my-token',
        }),
      );
      expect(result).toBe(mockStatus);
    });

    it('throws when not authenticated', async () => {
      const api = createFediwayAPI('https://fediway.com', () => null);
      await expect(api.createStatus({ status: 'hello' }))
        .rejects
        .toThrow('Not authenticated');
    });

    it('passes full params including item data', async () => {
      mockedRequest.mockResolvedValue({});

      const api = createFediwayAPI('https://fediway.com', () => 'token');
      await api.createStatus({
        status: 'Great movie!',
        visibility: 'public',
        itemUrl: 'https://example.com/movie',
        itemType: 'movie',
        rating: 4,
      });

      expect(mockedRequest).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: {
            status: 'Great movie!',
            visibility: 'public',
            itemUrl: 'https://example.com/movie',
            itemType: 'movie',
            rating: 4,
          },
        }),
      );
    });
  });

  describe('getItem', () => {
    it('fetches from /api/fediway/v1/items/lookup with encoded URL', async () => {
      const mockAggregation = { averageRating: 4.5 };
      mockedRequest.mockResolvedValue(mockAggregation);

      const api = createFediwayAPI('https://fediway.com', () => 'token');
      const result = await api.getItem('https://example.com/book?id=1&type=fiction');

      expect(mockedRequest).toHaveBeenCalledWith(
        `https://fediway.com/api/fediway/v1/items/lookup?url=${encodeURIComponent('https://example.com/book?id=1&type=fiction')}`,
        expect.objectContaining({ token: 'token' }),
      );
      expect(result).toBe(mockAggregation);
    });

    it('works without authentication', async () => {
      mockedRequest.mockResolvedValue({});

      const api = createFediwayAPI('https://fediway.com', () => null);
      await api.getItem('https://example.com');

      expect(mockedRequest).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ token: undefined }),
      );
    });
  });

  describe('getItemStatuses', () => {
    it('fetches from /api/fediway/v1/items/statuses', async () => {
      const mockStatuses = [{ id: '1' }, { id: '2' }];
      mockedRequest.mockResolvedValue(mockStatuses);

      const api = createFediwayAPI('https://fediway.com', () => 'token');
      const result = await api.getItemStatuses('https://example.com/movie');

      const calledUrl = mockedRequest.mock.calls[0][0];
      expect(calledUrl).toContain('/api/fediway/v1/items/statuses');
      expect(calledUrl).toContain('url=');
      expect(result).toBe(mockStatuses);
    });

    it('includes limit and maxId in query params', async () => {
      mockedRequest.mockResolvedValue([]);

      const api = createFediwayAPI('https://fediway.com', () => 'token');
      await api.getItemStatuses('https://example.com', { limit: 20, maxId: 'abc' });

      const calledUrl = mockedRequest.mock.calls[0][0];
      expect(calledUrl).toContain('limit=20');
      expect(calledUrl).toContain('max_id=abc');
    });

    it('omits limit and maxId when not provided', async () => {
      mockedRequest.mockResolvedValue([]);

      const api = createFediwayAPI('https://fediway.com', () => 'token');
      await api.getItemStatuses('https://example.com');

      const calledUrl = mockedRequest.mock.calls[0][0];
      expect(calledUrl).not.toContain('limit=');
      expect(calledUrl).not.toContain('max_id=');
    });

    it('works without authentication', async () => {
      mockedRequest.mockResolvedValue([]);

      const api = createFediwayAPI('https://fediway.com', () => null);
      await api.getItemStatuses('https://example.com');

      expect(mockedRequest).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ token: undefined }),
      );
    });
  });

  describe('base URL', () => {
    it('constructs URLs from the provided baseUrl', async () => {
      mockedRequest.mockResolvedValue({});

      const api = createFediwayAPI('https://custom-instance.org', () => 'token');
      await api.createStatus({ status: 'test' });

      expect(mockedRequest).toHaveBeenCalledWith(
        'https://custom-instance.org/api/fediway/v1/statuses',
        expect.anything(),
      );
    });
  });
});
