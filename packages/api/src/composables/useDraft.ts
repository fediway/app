import type { DraftData } from '../cache/db';
import { getDb } from '../cache/db';
import { writeSentinel } from '../cache/integrity';

export interface UseDraftReturn {
  load: () => Promise<DraftData | null>;
  save: (data: DraftData) => void;
  flush: () => Promise<void>;
  discard: () => Promise<void>;
}

export function useDraft(accountKey: string): UseDraftReturn {
  let pending: DraftData | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  async function doSave(): Promise<void> {
    if (!pending)
      return;
    const data = pending;
    pending = null;
    timer = null;
    await getDb().drafts.put({ ...data, accountKey, updatedAt: Date.now() });
    await writeSentinel();
  }

  function save(data: DraftData): void {
    pending = data;
    if (timer)
      clearTimeout(timer);
    timer = setTimeout(() => {
      doSave();
    }, 1000);
  }

  async function flush(): Promise<void> {
    if (pending) {
      if (timer)
        clearTimeout(timer);
      timer = null;
      await doSave();
    }
  }

  async function load(): Promise<DraftData | null> {
    const stored = await getDb().drafts.get(accountKey);
    if (!stored)
      return null;
    const { accountKey: _ak, updatedAt: _ua, ...data } = stored;
    return data;
  }

  async function discard(): Promise<void> {
    pending = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    await getDb().drafts.delete(accountKey);
  }

  return { load, save, flush, discard };
}
