// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockConfig = {
  feedbackKaneoBaseUrl: 'http://kaneo:1337',
  feedbackKaneoApiKey: 'test-api-key',
  feedbackKaneoProjectId: 'proj-123',
};

let mockDataJson: string = '{}';
const mockFetchFn = vi.fn();

vi.stubGlobal('useRuntimeConfig', () => mockConfig);
vi.stubGlobal('$fetch', mockFetchFn);

vi.mock('h3', () => ({
  defineEventHandler: (fn: any) => fn,
  readFormData: async () => {
    const fd = new FormData();
    fd.append('data', mockDataJson);
    return fd;
  },
  createError: (opts: { statusCode: number; statusMessage: string }) => {
    const err = new Error(opts.statusMessage) as any;
    err.statusCode = opts.statusCode;
    return err;
  },
  getRequestIP: () => '127.0.0.1',
}));

function makeValidPayload(overrides: Record<string, unknown> = {}) {
  return {
    category: 'bug',
    description: 'The timeline freezes when scrolling fast',
    expectedBehavior: 'Should keep scrolling smoothly',
    frequency: 'sometimes',
    context: {
      app: { version: '0.1.0-beta', platform: 'web' },
      device: {
        userAgent: 'Mozilla/5.0',
        viewport: { width: 1920, height: 1080 },
        screen: { width: 1920, height: 1080, pixelRatio: 2 },
        online: true,
        language: 'en-US',
      },
      route: { path: '/home', name: 'index', params: {} },
      theme: 'dark',
      instanceUrl: 'https://mastodon.social',
      user: { authenticated: true, handle: 'user@mastodon.social' },
      timestamp: '2026-04-01T12:00:00.000Z',
      recentErrors: [],
    },
    ...overrides,
  };
}

let handler: any;

beforeEach(async () => {
  vi.resetModules();
  mockFetchFn.mockReset();

  mockConfig.feedbackKaneoBaseUrl = 'http://kaneo:1337';
  mockConfig.feedbackKaneoApiKey = 'test-api-key';
  mockConfig.feedbackKaneoProjectId = 'proj-123';

  const mod = await import('../feedback.post');
  handler = mod.default;
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function callHandler(body: unknown) {
  mockDataJson = JSON.stringify(body);
  return handler({});
}

describe('post /api/feedback', () => {
  describe('configuration', () => {
    it('throws 501 when KANEO_BASE_URL is not set', async () => {
      mockConfig.feedbackKaneoBaseUrl = '';
      await expect(callHandler(makeValidPayload())).rejects.toMatchObject({ statusCode: 501 });
    });

    it('throws 501 when KANEO_API_KEY is not set', async () => {
      mockConfig.feedbackKaneoApiKey = '';
      await expect(callHandler(makeValidPayload())).rejects.toMatchObject({ statusCode: 501 });
    });

    it('throws 501 when KANEO_PROJECT_ID is not set', async () => {
      mockConfig.feedbackKaneoProjectId = '';
      await expect(callHandler(makeValidPayload())).rejects.toMatchObject({ statusCode: 501 });
    });
  });

  describe('validation', () => {
    it('throws 400 when category is missing', async () => {
      const payload = makeValidPayload();
      delete (payload as any).category;
      await expect(callHandler(payload)).rejects.toMatchObject({ statusCode: 400 });
    });

    it('throws 400 when category is invalid', async () => {
      await expect(callHandler(makeValidPayload({ category: 'invalid' }))).rejects.toMatchObject({ statusCode: 400 });
    });

    it('throws 400 when description is empty', async () => {
      await expect(callHandler(makeValidPayload({ description: '' }))).rejects.toMatchObject({ statusCode: 400 });
    });

    it('throws 400 when description exceeds 2000 chars', async () => {
      await expect(callHandler(makeValidPayload({ description: 'x'.repeat(2001) }))).rejects.toMatchObject({ statusCode: 400 });
    });

    it('throws 400 when context is missing', async () => {
      await expect(callHandler(makeValidPayload({ context: undefined }))).rejects.toMatchObject({ statusCode: 400 });
    });

    it('throws 400 when body is null', async () => {
      await expect(callHandler(null)).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe('kaneo integration', () => {
    it('posts formatted task to Kaneo and returns success', async () => {
      mockFetchFn.mockResolvedValueOnce({ id: 'task-1' });

      const result = await callHandler(makeValidPayload());

      expect(result).toEqual({ success: true, id: 'task-1' });
      expect(mockFetchFn).toHaveBeenCalledOnce();
      expect(mockFetchFn).toHaveBeenCalledWith(
        'http://kaneo:1337/api/task/proj-123',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'test-api-key',
          }),
          body: expect.objectContaining({
            title: expect.stringContaining('Bug'),
            description: expect.stringContaining('The timeline freezes when scrolling fast'),
            priority: 'medium',
            status: 'to-do',
          }),
        }),
      );
    });

    it('includes user handle in description', async () => {
      mockFetchFn.mockResolvedValueOnce({ id: 'task-2' });
      await callHandler(makeValidPayload());
      expect(mockFetchFn.mock.calls[0][1].body.description).toContain('user@mastodon.social');
    });

    it('includes expected behavior and frequency for bugs', async () => {
      mockFetchFn.mockResolvedValueOnce({ id: 'task-3' });
      await callHandler(makeValidPayload());
      const desc = mockFetchFn.mock.calls[0][1].body.description;
      expect(desc).toContain('Should keep scrolling smoothly');
      expect(desc).toContain('sometimes');
    });

    it('maps suggestion to low priority', async () => {
      mockFetchFn.mockResolvedValueOnce({ id: 'task-4' });
      await callHandler(makeValidPayload({ category: 'suggestion', description: 'Dark mode scheduling' }));
      expect(mockFetchFn.mock.calls[0][1].body.priority).toBe('low');
      expect(mockFetchFn.mock.calls[0][1].body.title).toContain('Suggestion');
    });

    it('maps other to no-priority', async () => {
      mockFetchFn.mockResolvedValueOnce({ id: 'task-5' });
      await callHandler(makeValidPayload({ category: 'other', description: 'Just a thought' }));
      expect(mockFetchFn.mock.calls[0][1].body.priority).toBe('no-priority');
    });

    it('throws 502 when Kaneo returns an error', async () => {
      mockFetchFn.mockRejectedValueOnce(new Error('Connection refused'));
      await expect(callHandler(makeValidPayload())).rejects.toMatchObject({ statusCode: 502 });
    });
  });
});
