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

export const db = new FediwayDB();
