import type { FediwayStatus } from '@repo/types';
import Dexie from 'dexie';

export interface CachedStatus {
  timelineKey: string;
  statusId: string;
  status: FediwayStatus;
  cachedAt: number;
}

export class FediwayDB extends Dexie {
  timelineCache!: Dexie.Table<CachedStatus>;

  constructor() {
    super('fediway');
    this.version(1).stores({
      timelineCache: '[timelineKey+statusId], timelineKey, cachedAt',
    });
  }
}

let _db: FediwayDB | null = null;

export function getDb(): FediwayDB {
  if (!_db) {
    _db = new FediwayDB();
  }
  return _db;
}
