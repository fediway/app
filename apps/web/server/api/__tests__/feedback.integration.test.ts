// @vitest-environment node
import type { AddressInfo } from 'node:net';
import { createServer } from 'node:http';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

let mockKaneoServer: ReturnType<typeof createServer>;
let mockKaneoPort: number;
let lastRequest: { url: string; headers: Record<string, string | string[] | undefined>; body: any } | null = null;
let kaneoResponseStatus = 200;
let kaneoResponseBody: any = { id: 'task-99' };

beforeAll(async () => {
  mockKaneoServer = createServer((req, res) => {
    let body = '';
    req.on('data', (chunk: string) => {
      body += chunk;
    });
    req.on('end', () => {
      lastRequest = {
        url: req.url || '',
        headers: req.headers,
        body: JSON.parse(body),
      };
      res.writeHead(kaneoResponseStatus, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(kaneoResponseBody));
    });
  });

  await new Promise<void>(resolve => mockKaneoServer.listen(0, resolve));
  mockKaneoPort = (mockKaneoServer.address() as AddressInfo).port;
});

afterAll(() => {
  mockKaneoServer.close();
});

const mockConfig = {
  feedbackKaneoBaseUrl: '',
  feedbackKaneoApiKey: 'integration-api-key',
  feedbackKaneoProjectId: 'proj-test',
};

let mockDataJson = '{}';

vi.stubGlobal('useRuntimeConfig', () => mockConfig);

const realFetch = globalThis.fetch;
vi.stubGlobal('$fetch', async (url: string, opts: any) => {
  const res = await realFetch(url, {
    method: opts.method,
    headers: opts.headers,
    body: JSON.stringify(opts.body),
  });
  const data = await res.json();
  if (!res.ok)
    throw Object.assign(new Error(`${res.status}`), { statusCode: res.status, data });
  return data;
});

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

const validPayload = {
  category: 'bug' as const,
  description: 'Integration test bug report',
  context: {
    app: { version: '0.1.0-beta', platform: 'web' },
    device: {
      userAgent: 'test-agent',
      viewport: { width: 1280, height: 720 },
      screen: { width: 1920, height: 1080, pixelRatio: 1 },
      online: true,
      language: 'en',
    },
    route: { path: '/test', params: {} },
    theme: 'light',
    instanceUrl: null,
    user: { authenticated: false, handle: null },
    timestamp: '2026-04-01T00:00:00.000Z',
    recentErrors: [{ message: 'TypeError: x is not a function', timestamp: 1711843200000 }],
  },
};

let handler: any;

beforeEach(async () => {
  vi.resetModules();
  lastRequest = null;
  kaneoResponseStatus = 200;
  kaneoResponseBody = { id: 'task-99' };
  mockConfig.feedbackKaneoBaseUrl = `http://127.0.0.1:${mockKaneoPort}`;
  mockConfig.feedbackKaneoApiKey = 'integration-api-key';
  mockConfig.feedbackKaneoProjectId = 'proj-test';
  mockDataJson = JSON.stringify(validPayload);

  const mod = await import('../feedback.post');
  handler = mod.default;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('feedback server route — integration with mock kaneo', () => {
  it('posts to correct Kaneo endpoint with API key', async () => {
    const result = await handler({});

    expect(result).toEqual({ success: true, id: 'task-99' });
    expect(lastRequest).not.toBeNull();
    expect(lastRequest!.url).toBe('/api/task/proj-test');
    expect(lastRequest!.headers['x-api-key']).toBe('integration-api-key');
  });

  it('sends formatted title with category emoji', async () => {
    await handler({});
    expect(lastRequest!.body.title).toContain('🐛');
    expect(lastRequest!.body.title).toContain('Bug');
    expect(lastRequest!.body.title).toContain('Integration test bug report');
  });

  it('sends description with context', async () => {
    await handler({});
    const desc = lastRequest!.body.description;
    expect(desc).toContain('Integration test bug report');
    expect(desc).toContain('0.1.0-beta');
    expect(desc).toContain('/test');
    expect(desc).toContain('Not signed in');
  });

  it('includes recent errors in description', async () => {
    await handler({});
    expect(lastRequest!.body.description).toContain('TypeError: x is not a function');
  });

  it('sets priority based on category', async () => {
    await handler({});
    expect(lastRequest!.body.priority).toBe('medium');
  });

  it('handles Kaneo 500 error gracefully', async () => {
    kaneoResponseStatus = 500;
    kaneoResponseBody = { message: 'Internal error' };
    await expect(handler({})).rejects.toMatchObject({ statusCode: 502 });
  });

  it('handles Kaneo 401 (bad token) gracefully', async () => {
    kaneoResponseStatus = 401;
    kaneoResponseBody = { message: 'Unauthorized' };
    await expect(handler({})).rejects.toMatchObject({ statusCode: 502 });
  });
});
