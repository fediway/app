/**
 * Focused test for useTimeline.loadMore() pagination.
 * Tests the data flow: fetchTimeline → dedup → statuses append.
 * Uses direct mock of the client's list() method.
 *
 * @vitest-environment happy-dom
 */
import { makeStatus } from '@repo/config/vitest/helpers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let mockListFn: ReturnType<typeof vi.fn>;
let callCount: number;

vi.mock('../../src/composables/useClient', () => ({
  useClient: () => ({
    rest: {
      v1: {
        timelines: {
          home: {
            list: (...args: any[]) => mockListFn(...args),
          },
        },
      },
    },
  }),
}));

vi.mock('../../src/composables/useStatusStore', () => ({
  useStatusStore: () => ({
    setMany: vi.fn(),
  }),
}));

vi.mock('../../src/auth/account-store', () => ({
  getActiveAccountKeySync: () => 'test-user',
}));

vi.mock('../../src/cache/timeline-cache', () => ({
  useTimelineCache: () => null,
}));

const { useTimeline } = await import('../../src/composables/useTimeline');

beforeEach(() => {
  callCount = 0;
  mockListFn = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useTimeline loadMore pagination', () => {
  it('appends page 2 statuses after fetch', async () => {
    const page1 = Array.from({ length: 20 }, (_, i) => makeStatus(`p1-${i}`));
    const page2 = Array.from({ length: 5 }, (_, i) => makeStatus(`p2-${i}`));

    mockListFn.mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? page1 : page2;
    });

    const timeline = useTimeline({ type: 'home' });

    await timeline.fetch();
    expect(timeline.statuses.value).toHaveLength(20);
    expect(timeline.hasMore.value).toBe(true);

    await timeline.loadMore();
    expect(timeline.statuses.value).toHaveLength(25);
    expect(timeline.hasMore.value).toBe(false);
  });

  it('passes maxId from last status on page 1', async () => {
    const page1 = Array.from({ length: 20 }, (_, i) => makeStatus(`s-${19 - i}`));

    mockListFn.mockResolvedValue(page1);

    const timeline = useTimeline({ type: 'home' });
    await timeline.fetch();

    timeline.hasMore.value = true;
    await timeline.loadMore();

    expect(mockListFn).toHaveBeenCalledTimes(2);
    expect(mockListFn.mock.calls[1]![0]).toMatchObject({ maxId: 's-0' });
  });

  it('dedup filters duplicates between pages', async () => {
    const page1 = Array.from({ length: 20 }, (_, i) => makeStatus(`s-${i}`));
    const page2 = [
      makeStatus('new-1'),
      makeStatus('s-18'),
      makeStatus('new-2'),
    ];

    mockListFn.mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? page1 : page2;
    });

    const timeline = useTimeline({ type: 'home' });
    await timeline.fetch();
    await timeline.loadMore();

    expect(timeline.statuses.value).toHaveLength(22);
  });

  it('error on loadMore allows retry', async () => {
    const page1 = Array.from({ length: 20 }, (_, i) => makeStatus(`s-${i}`));
    const page2 = [makeStatus('retry-1')];

    mockListFn.mockImplementation(async () => {
      callCount++;
      if (callCount === 1)
        return page1;
      if (callCount === 2)
        throw new Error('Network error');
      return page2;
    });

    const timeline = useTimeline({ type: 'home' });
    await timeline.fetch();

    await timeline.loadMore();
    expect(timeline.error.value).toBeInstanceOf(Error);
    expect(timeline.statuses.value).toHaveLength(20);

    await timeline.loadMore();
    expect(timeline.error.value).toBeNull();
    expect(timeline.statuses.value).toHaveLength(21);
  });

  it('loadMore is a no-op when hasMore is false', async () => {
    const page1 = Array.from({ length: 5 }, (_, i) => makeStatus(`s-${i}`));
    mockListFn.mockResolvedValue(page1);

    const timeline = useTimeline({ type: 'home' });
    await timeline.fetch();
    expect(timeline.hasMore.value).toBe(false);

    await timeline.loadMore();
    expect(mockListFn).toHaveBeenCalledTimes(1);
  });

  it('loadMore is a no-op while already loading', async () => {
    const page1 = Array.from({ length: 20 }, (_, i) => makeStatus(`s-${i}`));
    let resolveSecond: () => void;
    const secondPromise = new Promise<void>((r) => {
      resolveSecond = r;
    });

    mockListFn.mockImplementation(async () => {
      callCount++;
      if (callCount === 1)
        return page1;
      await secondPromise;
      return [makeStatus('delayed')];
    });

    const timeline = useTimeline({ type: 'home' });
    await timeline.fetch();

    const first = timeline.loadMore();
    const second = timeline.loadMore();

    resolveSecond!();
    await first;
    await second;

    // Only 2 API calls: fetch + one loadMore (second was blocked)
    expect(mockListFn).toHaveBeenCalledTimes(2);
  });
});
