import type { Ref, ShallowRef } from 'vue';
import type { QueuedAction } from '../cache/db';
import type { MastoClient } from '../client';
import { ref, shallowRef } from 'vue';
import { getDb } from '../cache/db';
import { FediwayAPIError, FediwayNetworkError } from '../errors';
import { useClient } from './useClient';

export interface ActionQueueError {
  action: QueuedAction;
  error: Error;
}

export interface UseActionQueueOptions {
  onError?: (e: ActionQueueError) => void;
  onProcessed?: (action: QueuedAction) => void;
}

export interface UseActionQueueReturn {
  pending: ShallowRef<QueuedAction[]>;
  isProcessing: Ref<boolean>;
  enqueue: (type: QueuedAction['type'], statusId: string) => Promise<void>;
  processQueue: () => Promise<void>;
  clear: () => Promise<void>;
}

const OPPOSITES: Record<string, QueuedAction['type']> = {
  favourite: 'unfavourite',
  unfavourite: 'favourite',
  reblog: 'unreblog',
  unreblog: 'reblog',
  bookmark: 'unbookmark',
  unbookmark: 'bookmark',
};

const DISPATCH: Record<QueuedAction['type'], (client: MastoClient, statusId: string) => Promise<unknown>> = {
  favourite: (c, id) => c.rest.v1.statuses.$select(id).favourite(),
  unfavourite: (c, id) => c.rest.v1.statuses.$select(id).unfavourite(),
  reblog: (c, id) => c.rest.v1.statuses.$select(id).reblog(),
  unreblog: (c, id) => c.rest.v1.statuses.$select(id).unreblog(),
  bookmark: (c, id) => c.rest.v1.statuses.$select(id).bookmark(),
  unbookmark: (c, id) => c.rest.v1.statuses.$select(id).unbookmark(),
};

export function useActionQueue(options?: UseActionQueueOptions): UseActionQueueReturn {
  const pending = shallowRef<QueuedAction[]>([]);
  const isProcessing = ref(false);

  async function refreshPending(): Promise<void> {
    pending.value = await getDb().actionQueue.orderBy('id').toArray();
  }

  async function enqueue(type: QueuedAction['type'], statusId: string): Promise<void> {
    const opposite = OPPOSITES[type];
    if (opposite) {
      const existing = await getDb().actionQueue.where('statusId').equals(statusId).filter(a => a.type === opposite).first();

      if (existing?.id != null) {
        await getDb().actionQueue.delete(existing.id);
        await refreshPending();
        return;
      }
    }

    await getDb().actionQueue.add({
      type,
      statusId,
      createdAt: Date.now(),
      attempts: 0,
    });
    await refreshPending();
  }

  async function processQueue(): Promise<void> {
    isProcessing.value = true;
    try {
      const client = useClient();
      const actions = await getDb().actionQueue.orderBy('id').toArray();

      for (const action of actions) {
        const backoffMs = Math.min(1000 * 2 ** action.attempts, 30000);
        if (action.attempts > 0) {
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }

        try {
          await DISPATCH[action.type](client, action.statusId);
          await getDb().actionQueue.delete(action.id!);
          options?.onProcessed?.(action);
        }
        catch (err) {
          if (err instanceof FediwayNetworkError) {
            await getDb().actionQueue.update(action.id!, { attempts: action.attempts + 1 });
            break;
          }
          if (err instanceof FediwayAPIError && err.isUnauthorized) {
            options?.onError?.({ action, error: err });
            break;
          }
          // Non-401 API error — unrecoverable, discard
          await getDb().actionQueue.delete(action.id!);
          options?.onError?.({ action, error: err instanceof Error ? err : new Error(String(err)) });
        }
      }
    }
    finally {
      isProcessing.value = false;
      await refreshPending();
    }
  }

  async function clear(): Promise<void> {
    await getDb().actionQueue.clear();
    await refreshPending();
  }

  // Load initial state
  refreshPending();

  return { pending, isProcessing, enqueue, processQueue, clear };
}
