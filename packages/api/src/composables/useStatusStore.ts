import type { FediwayStatus } from '@repo/types';
import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

const store = reactive(new Map<string, FediwayStatus>());
const deleted = reactive(new Set<string>());
const pendingMutations = reactive(new Set<string>());

/**
 * Interaction fields owned by user actions (favourite, reblog, bookmark).
 * When a mutation is pending, these fields are protected from being
 * overwritten by background refetches or stale API responses.
 */
const INTERACTION_FIELDS: readonly (keyof FediwayStatus)[] = [
  'favourited',
  'favouritesCount',
  'reblogged',
  'reblogsCount',
  'bookmarked',
];

export interface SetOptions {
  /** Bypass interaction field protection (used for error rollback) */
  force?: boolean;
}

export interface UseStatusStoreReturn {
  get: (id: string) => FediwayStatus | undefined;
  set: (status: FediwayStatus, opts?: SetOptions) => void;
  setMany: (statuses: FediwayStatus[], opts?: SetOptions) => void;
  remove: (id: string) => boolean;
  restore: (id: string) => void;
  isDeleted: (id: string) => boolean;
  patch: (id: string, partial: Partial<FediwayStatus>) => FediwayStatus | undefined;
  commitMutation: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
  readonly size: ComputedRef<number>;
}

export function useStatusStore(): UseStatusStoreReturn {
  function get(id: string): FediwayStatus | undefined {
    return store.get(id);
  }

  function set(status: FediwayStatus, opts?: SetOptions): void {
    if (!opts?.force && pendingMutations.has(status.id)) {
      // Mutation pending — protect interaction fields, accept everything else
      const existing = store.get(status.id);
      if (existing) {
        const merged: FediwayStatus = { ...status };
        for (const field of INTERACTION_FIELDS) {
          if (field in existing) {
            (merged as any)[field] = (existing as any)[field];
          }
        }
        store.set(status.id, merged);
        return;
      }
    }
    store.set(status.id, status);
  }

  function setMany(statuses: FediwayStatus[], opts?: SetOptions): void {
    for (const status of statuses) {
      set(status, opts);
    }
  }

  function remove(id: string): boolean {
    deleted.add(id);
    return store.delete(id);
  }

  function restore(id: string): void {
    deleted.delete(id);
  }

  function isDeleted(id: string): boolean {
    return deleted.has(id);
  }

  function patch(id: string, partial: Partial<FediwayStatus>): FediwayStatus | undefined {
    const current = store.get(id);
    if (!current)
      return undefined;
    const updated = { ...current, ...partial } as FediwayStatus;
    store.set(id, updated);
    pendingMutations.add(id);
    return updated;
  }

  function commitMutation(id: string): void {
    pendingMutations.delete(id);
  }

  function has(id: string): boolean {
    return store.has(id);
  }

  function clear(): void {
    store.clear();
    deleted.clear();
    pendingMutations.clear();
  }

  const size = computed(() => store.size);

  return {
    get,
    set,
    setMany,
    remove,
    restore,
    isDeleted,
    patch,
    commitMutation,
    has,
    clear,
    size,
  };
}
