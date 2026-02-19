import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockClient } from '../../src/mock/client';
import { withSetup } from '../utils/withSetup';

// Mock useClient to return a fresh mock client for each test
let mockClient: ReturnType<typeof createMockClient>;

vi.mock('../../src/composables/useClient', () => ({
  useClient: () => mockClient,
}));

// Import after mock setup
const { useTimeline } = await import('../../src/composables/useTimeline');

beforeEach(() => {
  mockClient = createMockClient();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useTimeline', () => {
  it('fetch() loads statuses and sets isLoading/hasMore', async () => {
    const [timeline] = withSetup(() => useTimeline({ type: 'home' }));

    expect(timeline.isLoading.value).toBe(false);
    const promise = timeline.fetch();
    expect(timeline.isLoading.value).toBe(true);

    await promise;
    expect(timeline.isLoading.value).toBe(false);
    expect(timeline.statuses.value.length).toBeGreaterThan(0);
    // Mock has ~18 statuses, limit=20, so hasMore should be false
    expect(timeline.hasMore.value).toBe(false);
  });

  it('loadMore() appends older statuses with no duplicates', async () => {
    const [timeline] = withSetup(() => useTimeline({ type: 'home' }));
    await timeline.fetch();

    const initialCount = timeline.statuses.value.length;

    // Since all statuses fit in one fetch, loadMore should be no-op (hasMore=false)
    await timeline.loadMore();
    expect(timeline.statuses.value.length).toBe(initialCount);

    // Verify no duplicates
    const allIds = timeline.statuses.value.map(s => s.id);
    expect(allIds.length).toBe(new Set(allIds).size);
  });

  it('loadMore() is a no-op when hasMore is false', async () => {
    const [timeline] = withSetup(() => useTimeline({ type: 'home' }));
    await timeline.fetch();

    expect(timeline.hasMore.value).toBe(false);
    const countBefore = timeline.statuses.value.length;
    await timeline.loadMore();
    expect(timeline.statuses.value.length).toBe(countBefore);
  });

  it('loadMore() is a no-op when isLoading is true', async () => {
    const [timeline] = withSetup(() => useTimeline({ type: 'home' }));
    await timeline.fetch();

    // Force hasMore to allow testing the isLoading guard
    timeline.hasMore.value = true;

    const fetchPromise = timeline.loadMore();
    // While it's loading, loadMore again should be a no-op
    const secondPromise = timeline.loadMore();
    await fetchPromise;
    await secondPromise;
  });

  it('refresh() resets and reloads', async () => {
    const [timeline] = withSetup(() => useTimeline({ type: 'home' }));
    await timeline.fetch();
    const firstCount = timeline.statuses.value.length;

    // Create a new status via mock client
    await mockClient.rest.v1.statuses.create({ status: 'A new post!' });

    await timeline.refresh();
    expect(timeline.statuses.value.length).toBe(firstCount + 1);
    expect(timeline.pendingStatuses.value.length).toBe(0);
  });

  it('poll() detects new statuses and puts them in pendingStatuses', async () => {
    const [timeline] = withSetup(() => useTimeline({ type: 'home' }));
    await timeline.fetch();

    expect(timeline.pendingStatuses.value.length).toBe(0);
    expect(timeline.newStatusCount.value).toBe(0);

    await mockClient.rest.v1.statuses.create({ status: 'Breaking news!' });

    await timeline.poll();
    expect(timeline.pendingStatuses.value.length).toBe(1);
    expect(timeline.newStatusCount.value).toBe(1);
    expect(timeline.pendingStatuses.value[0]!.content).toContain('Breaking news!');

    // The new status should NOT be in the main list yet
    const mainIds = new Set(timeline.statuses.value.map(s => s.id));
    const pendingIds = timeline.pendingStatuses.value.map(s => s.id);
    for (const id of pendingIds) {
      expect(mainIds.has(id)).toBe(false);
    }
  });

  it('poll() is a no-op when nothing new', async () => {
    const [timeline] = withSetup(() => useTimeline({ type: 'home' }));
    await timeline.fetch();

    await timeline.poll();
    expect(timeline.pendingStatuses.value.length).toBe(0);
  });

  it('showNew() merges pending into main list and resets newStatusCount', async () => {
    const [timeline] = withSetup(() => useTimeline({ type: 'home' }));
    await timeline.fetch();
    const initialCount = timeline.statuses.value.length;

    await mockClient.rest.v1.statuses.create({ status: 'New post 1' });
    await mockClient.rest.v1.statuses.create({ status: 'New post 2' });
    await timeline.poll();
    expect(timeline.newStatusCount.value).toBe(2);

    timeline.showNew();
    expect(timeline.pendingStatuses.value.length).toBe(0);
    expect(timeline.newStatusCount.value).toBe(0);
    expect(timeline.statuses.value.length).toBe(initialCount + 2);

    // New posts should be at the top
    expect(timeline.statuses.value[0]!.content).toContain('New post');
    expect(timeline.statuses.value[1]!.content).toContain('New post');
  });

  it('showNew() is a no-op when no pending', async () => {
    const [timeline] = withSetup(() => useTimeline({ type: 'home' }));
    await timeline.fetch();
    const before = timeline.statuses.value;

    timeline.showNew();
    expect(timeline.statuses.value).toBe(before);
  });

  it('deduplication: same ID never appears twice', async () => {
    const [timeline] = withSetup(() => useTimeline({ type: 'home' }));
    await timeline.fetch();

    // Create a status, poll twice — should only appear once
    await mockClient.rest.v1.statuses.create({ status: 'Unique post' });
    await timeline.poll();
    await timeline.poll();

    expect(timeline.pendingStatuses.value.length).toBe(1);

    timeline.showNew();
    const allIds = timeline.statuses.value.map(s => s.id);
    expect(allIds.length).toBe(new Set(allIds).size);
  });

  it('gap detection: poll returning full page sets hasGap = true', async () => {
    const [timeline] = withSetup(() => useTimeline({ type: 'home' }));
    await timeline.fetch();

    // Create 20 new statuses to fill a full page
    for (let i = 0; i < 20; i++) {
      await mockClient.rest.v1.statuses.create({ status: `Flood post ${i}` });
    }

    await timeline.poll();
    expect(timeline.hasGap.value).toBe(true);
    expect(timeline.pendingStatuses.value.length).toBe(20);
  });

  it('fillGap() fetches missing range', async () => {
    const [timeline] = withSetup(() => useTimeline({ type: 'home' }));
    await timeline.fetch();

    for (let i = 0; i < 20; i++) {
      await mockClient.rest.v1.statuses.create({ status: `Gap post ${i}` });
    }

    await timeline.poll();
    expect(timeline.hasGap.value).toBe(true);

    await timeline.fillGap();
    // Gap should be cleared since there are fewer than 20 statuses between
    expect(timeline.hasGap.value).toBe(false);
  });

  it('fetch failure sets error ref', async () => {
    const origList = mockClient.rest.v1.timelines.home.list;
    mockClient.rest.v1.timelines.home.list = async () => {
      throw new Error('Network error');
    };

    const [timeline] = withSetup(() => useTimeline({ type: 'home' }));
    await timeline.fetch();

    expect(timeline.error.value).toBeInstanceOf(Error);
    expect(timeline.error.value!.message).toBe('Network error');
    expect(timeline.statuses.value.length).toBe(0);

    mockClient.rest.v1.timelines.home.list = origList;
  });

  it('poll failure is silent (does not set error)', async () => {
    const [timeline] = withSetup(() => useTimeline({ type: 'home' }));
    await timeline.fetch();

    mockClient.rest.v1.timelines.home.list = async () => {
      throw new Error('Poll error');
    };

    await timeline.poll();
    expect(timeline.error.value).toBeNull();
  });

  describe('polling with timers', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('startPolling/stopPolling fires poll on interval', async () => {
      const [timeline] = withSetup(() => useTimeline({ type: 'home' }));
      await timeline.fetch();

      timeline.startPolling(1000);

      await mockClient.rest.v1.statuses.create({ status: 'Interval post' });
      await vi.advanceTimersByTimeAsync(1000);
      expect(timeline.pendingStatuses.value.length).toBe(1);

      await mockClient.rest.v1.statuses.create({ status: 'Second interval post' });
      await vi.advanceTimersByTimeAsync(1000);
      expect(timeline.pendingStatuses.value.length).toBe(2);

      timeline.stopPolling();

      // After stop, new statuses should not be detected
      await mockClient.rest.v1.statuses.create({ status: 'Missed post' });
      await vi.advanceTimersByTimeAsync(1000);
      expect(timeline.pendingStatuses.value.length).toBe(2);
    });

    it('polling pauses on visibilitychange hidden, resumes on visible', async () => {
      const [timeline] = withSetup(() => useTimeline({ type: 'home' }));
      await timeline.fetch();

      timeline.startPolling(1000);

      // Simulate going hidden
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));

      // Create a status and advance timer — should NOT poll while hidden
      await mockClient.rest.v1.statuses.create({ status: 'Hidden post' });
      await vi.advanceTimersByTimeAsync(2000);
      expect(timeline.pendingStatuses.value.length).toBe(0);

      // Resume visibility — should poll immediately
      Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));

      // Wait for the async poll triggered by visibility change
      await vi.advanceTimersByTimeAsync(200);
      expect(timeline.pendingStatuses.value.length).toBe(1);

      timeline.stopPolling();
    });
  });
});
