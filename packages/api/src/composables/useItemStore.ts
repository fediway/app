import type { Item } from '@repo/types';
import { reactive } from 'vue';

/**
 * Shared item entity cache — keyed by URL.
 *
 * Any page that fetches item data (explore, search, status cards)
 * seeds this store. Any page that displays an item (link page, item detail)
 * reads from it first for instant render, then hydrates from API.
 *
 * Same pattern as useStatusStore but for Items.
 */
const store = reactive(new Map<string, Item>());

export function useItemStore() {
  function get(url: string): Item | undefined {
    return store.get(url);
  }

  function set(item: Item): void {
    store.set(item.url, item);
  }

  function setMany(items: Item[]): void {
    for (const item of items) {
      store.set(item.url, item);
    }
  }

  function clear(): void {
    store.clear();
  }

  return { get, set, setMany, clear };
}

/** Reset all state — called on account switch via clearAllAccountState */
export function resetItemStoreState(): void {
  store.clear();
}
