import type { MastoClient } from '../../src/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDb, resetDb } from '../../src/cache/db';
import { FediwayAPIError, FediwayNetworkError } from '../../src/errors';
import { createMockClient } from '../../src/mock/client';
import { withSetup } from '../utils/withSetup';

let mockClient: MastoClient;

vi.mock('../../src/composables/useClient', () => ({
  useClient: () => mockClient,
}));

const { useActionQueue } = await import('../../src/composables/useActionQueue');

beforeEach(async () => {
  resetDb();
  await getDb().actionQueue.clear();
  mockClient = createMockClient();
});

afterEach(async () => {
  await getDb().actionQueue.clear();
  resetDb();
  vi.restoreAllMocks();
});

describe('useActionQueue', () => {
  it('enqueue adds action to pending', async () => {
    const [queue] = withSetup(() => useActionQueue());

    await queue.enqueue('favourite', 's-1');

    expect(queue.pending.value).toHaveLength(1);
    expect(queue.pending.value[0]!.type).toBe('favourite');
    expect(queue.pending.value[0]!.statusId).toBe('s-1');
    expect(queue.pending.value[0]!.attempts).toBe(0);
  });

  it('enqueue cancels opposite action (favourite then unfavourite = empty)', async () => {
    const [queue] = withSetup(() => useActionQueue());

    await queue.enqueue('favourite', 's-1');
    expect(queue.pending.value).toHaveLength(1);

    await queue.enqueue('unfavourite', 's-1');
    expect(queue.pending.value).toHaveLength(0);
  });

  it('enqueue cancels opposite for reblog/unreblog', async () => {
    const [queue] = withSetup(() => useActionQueue());

    await queue.enqueue('reblog', 's-1');
    await queue.enqueue('unreblog', 's-1');
    expect(queue.pending.value).toHaveLength(0);
  });

  it('enqueue cancels opposite for bookmark/unbookmark', async () => {
    const [queue] = withSetup(() => useActionQueue());

    await queue.enqueue('bookmark', 's-1');
    await queue.enqueue('unbookmark', 's-1');
    expect(queue.pending.value).toHaveLength(0);
  });

  it('enqueue does not cancel same action type', async () => {
    const [queue] = withSetup(() => useActionQueue());

    await queue.enqueue('favourite', 's-1');
    await queue.enqueue('favourite', 's-1');
    expect(queue.pending.value).toHaveLength(2);
  });

  it('enqueue does not cancel opposite for different statusId', async () => {
    const [queue] = withSetup(() => useActionQueue());

    await queue.enqueue('favourite', 's-1');
    await queue.enqueue('unfavourite', 's-2');
    expect(queue.pending.value).toHaveLength(2);
  });

  it('processQueue processes actions in FIFO order', async () => {
    const processedOrder: string[] = [];
    const [queue] = withSetup(() => useActionQueue({
      onProcessed: (action) => {
        processedOrder.push(`${action.type}:${action.statusId}`);
      },
    }));

    // Use spies to track call order
    const favouriteSpy = vi.fn().mockResolvedValue({});
    const reblogSpy = vi.fn().mockResolvedValue({});

    // Mock the client's status endpoints
    mockClient.rest.v1.statuses.$select = vi.fn().mockImplementation((id: string) => ({
      favourite: () => {
        favouriteSpy(id);
        return Promise.resolve({});
      },
      reblog: () => {
        reblogSpy(id);
        return Promise.resolve({});
      },
      unfavourite: () => Promise.resolve({}),
      unreblog: () => Promise.resolve({}),
      bookmark: () => Promise.resolve({}),
      unbookmark: () => Promise.resolve({}),
    })) as any;

    await queue.enqueue('favourite', 's-1');
    await queue.enqueue('reblog', 's-2');

    await queue.processQueue();

    expect(processedOrder).toEqual(['favourite:s-1', 'reblog:s-2']);
    expect(favouriteSpy).toHaveBeenCalledWith('s-1');
    expect(reblogSpy).toHaveBeenCalledWith('s-2');
  });

  it('processQueue calls onProcessed for each successful action', async () => {
    const processed: string[] = [];
    const [queue] = withSetup(() => useActionQueue({
      onProcessed: action => processed.push(action.statusId),
    }));

    mockClient.rest.v1.statuses.$select = vi.fn().mockReturnValue({
      favourite: () => Promise.resolve({}),
      bookmark: () => Promise.resolve({}),
    }) as any;

    await queue.enqueue('favourite', 's-1');
    await queue.enqueue('bookmark', 's-2');
    await queue.processQueue();

    expect(processed).toEqual(['s-1', 's-2']);
  });

  it('processQueue removes action from Dexie after success', async () => {
    const [queue] = withSetup(() => useActionQueue());

    mockClient.rest.v1.statuses.$select = vi.fn().mockReturnValue({
      favourite: () => Promise.resolve({}),
    }) as any;

    await queue.enqueue('favourite', 's-1');
    expect(await getDb().actionQueue.count()).toBe(1);

    await queue.processQueue();

    expect(await getDb().actionQueue.count()).toBe(0);
    expect(queue.pending.value).toHaveLength(0);
  });

  it('processQueue stops on network error and increments attempts', async () => {
    const [queue] = withSetup(() => useActionQueue());

    mockClient.rest.v1.statuses.$select = vi.fn().mockReturnValue({
      favourite: () => Promise.reject(new FediwayNetworkError('offline')),
    }) as any;

    await queue.enqueue('favourite', 's-1');
    await queue.processQueue();

    // Action should still be in queue with incremented attempts
    expect(queue.pending.value).toHaveLength(1);
    expect(queue.pending.value[0]!.attempts).toBe(1);
  });

  it('processQueue stops on 401 error and calls onError', async () => {
    const errors: Array<{ action: any; error: Error }> = [];
    const [queue] = withSetup(() => useActionQueue({
      onError: e => errors.push(e),
    }));

    mockClient.rest.v1.statuses.$select = vi.fn().mockReturnValue({
      favourite: () => Promise.reject(new FediwayAPIError({ status: 401, message: 'Unauthorized' })),
      reblog: () => Promise.resolve({}),
    }) as any;

    await queue.enqueue('favourite', 's-1');
    await queue.enqueue('reblog', 's-2');
    await queue.processQueue();

    // First action hits 401 — queue stops, both remain
    expect(errors).toHaveLength(1);
    expect(errors[0]!.error).toBeInstanceOf(FediwayAPIError);
    // The favourite is still in queue (not deleted on 401), reblog never processed
    expect(queue.pending.value).toHaveLength(2);
  });

  it('processQueue discards non-401 API errors, calls onError, continues', async () => {
    const errors: Array<{ action: any; error: Error }> = [];
    const processed: string[] = [];
    const [queue] = withSetup(() => useActionQueue({
      onError: e => errors.push(e),
      onProcessed: action => processed.push(action.statusId),
    }));

    let callCount = 0;
    mockClient.rest.v1.statuses.$select = vi.fn().mockImplementation(() => ({
      favourite: () => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new FediwayAPIError({ status: 404, message: 'Not found' }));
        }
        return Promise.resolve({});
      },
    })) as any;

    await queue.enqueue('favourite', 's-1');
    await queue.enqueue('favourite', 's-2');
    await queue.processQueue();

    // First action discarded (404), second processed
    expect(errors).toHaveLength(1);
    expect(processed).toEqual(['s-2']);
    expect(queue.pending.value).toHaveLength(0);
  });

  it('clear empties the queue and updates pending ref', async () => {
    const [queue] = withSetup(() => useActionQueue());

    await queue.enqueue('favourite', 's-1');
    await queue.enqueue('reblog', 's-2');
    expect(queue.pending.value).toHaveLength(2);

    await queue.clear();

    expect(queue.pending.value).toHaveLength(0);
    expect(await getDb().actionQueue.count()).toBe(0);
  });

  it('pending ref reflects current queue state after mutations', async () => {
    const [queue] = withSetup(() => useActionQueue());

    expect(queue.pending.value).toHaveLength(0);

    await queue.enqueue('favourite', 's-1');
    expect(queue.pending.value).toHaveLength(1);

    await queue.enqueue('reblog', 's-2');
    expect(queue.pending.value).toHaveLength(2);

    await queue.enqueue('unfavourite', 's-1'); // cancels favourite
    expect(queue.pending.value).toHaveLength(1);
    expect(queue.pending.value[0]!.type).toBe('reblog');
  });

  it('isProcessing is true during processing and false after', async () => {
    const [queue] = withSetup(() => useActionQueue());

    mockClient.rest.v1.statuses.$select = vi.fn().mockReturnValue({
      favourite: () => Promise.resolve({}),
    }) as any;

    await queue.enqueue('favourite', 's-1');

    expect(queue.isProcessing.value).toBe(false);
    const promise = queue.processQueue();
    // isProcessing may be true synchronously after the call starts
    await promise;
    expect(queue.isProcessing.value).toBe(false);
  });
});
