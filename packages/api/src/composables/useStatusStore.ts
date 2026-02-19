import type { FediwayStatus } from '@repo/types';
import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

const store = reactive(new Map<string, FediwayStatus>());

export interface UseStatusStoreReturn {
  get: (id: string) => FediwayStatus | undefined;
  set: (status: FediwayStatus) => void;
  setMany: (statuses: FediwayStatus[]) => void;
  remove: (id: string) => boolean;
  patch: (id: string, partial: Partial<FediwayStatus>) => FediwayStatus | undefined;
  has: (id: string) => boolean;
  clear: () => void;
  readonly size: ComputedRef<number>;
}

export function useStatusStore(): UseStatusStoreReturn {
  function get(id: string): FediwayStatus | undefined {
    return store.get(id);
  }

  function set(status: FediwayStatus): void {
    store.set(status.id, status);
  }

  function setMany(statuses: FediwayStatus[]): void {
    for (const status of statuses) {
      store.set(status.id, status);
    }
  }

  function remove(id: string): boolean {
    return store.delete(id);
  }

  function patch(id: string, partial: Partial<FediwayStatus>): FediwayStatus | undefined {
    const current = store.get(id);
    if (!current)
      return undefined;
    const updated = { ...current, ...partial } as FediwayStatus;
    store.set(id, updated);
    return updated;
  }

  function has(id: string): boolean {
    return store.has(id);
  }

  function clear(): void {
    store.clear();
  }

  const size = computed(() => store.size);

  return {
    get,
    set,
    setMany,
    remove,
    patch,
    has,
    clear,
    size,
  };
}
