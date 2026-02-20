import type { FediwayStatus } from '@repo/types';
import Dexie from 'dexie';

export interface CachedStatus {
  timelineKey: string;
  statusId: string;
  status: FediwayStatus;
  cachedAt: number;
}

export interface QueuedAction {
  id?: number;
  type: 'favourite' | 'unfavourite' | 'reblog' | 'unreblog' | 'bookmark' | 'unbookmark';
  statusId: string;
  createdAt: number;
  attempts: number;
}

export interface DraftData {
  content: string;
  spoilerText: string;
  visibility: 'public' | 'unlisted' | 'private' | 'direct';
  inReplyToId?: string;
  itemUrl?: string;
  itemType?: string;
  rating?: number;
}

export interface StoredDraft extends DraftData {
  accountKey: string;
  updatedAt: number;
}

export interface MetadataEntry {
  key: string;
  value: string;
}

export class FediwayDB extends Dexie {
  timelineCache!: Dexie.Table<CachedStatus>;
  actionQueue!: Dexie.Table<QueuedAction, number>;
  drafts!: Dexie.Table<StoredDraft, string>;
  metadata!: Dexie.Table<MetadataEntry, string>;

  constructor() {
    super('fediway');
    this.version(1).stores({
      timelineCache: '[timelineKey+statusId], timelineKey, cachedAt',
    });
    this.version(2).stores({
      timelineCache: '[timelineKey+statusId], timelineKey, cachedAt',
      actionQueue: '++id, statusId, createdAt',
    });
    this.version(3).stores({
      timelineCache: '[timelineKey+statusId], timelineKey, cachedAt',
      actionQueue: '++id, statusId, createdAt',
      drafts: 'accountKey',
      metadata: 'key',
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

/** Reset the singleton — for tests only. */
export function resetDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}
