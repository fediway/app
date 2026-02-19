// Auth utilities
export { discoverInstance, type InstanceInfo, normalizeInstanceUrl } from './auth/instance-discovery';
// Multi-account storage
export { loadAccountList, loadActiveAccountKey, scopedStorageKey } from './auth/storage';

// Cache
export { type CachedStatus, FediwayDB, getDb } from './cache';

export { useTimelineCache } from './cache';

// Client
export { createMastoClient, type MastoClient, type MastoClientConfig } from './client';

// Composables
export * from './composables';

// Client factory (real vs mock)
export { createClient, type CreateClientConfig } from './createClient';

// Errors
export {
  FediwayAPIError,
  FediwayNetworkError,
  isFediwayAPIError,
  isFediwayNetworkError,
} from './errors';

// Fediway API
export { createFediwayAPI, type CreateStatusParams, type FediwayAPI, type GetItemStatusesOptions } from './fediway-api';

// Mock client
export { createMockClient } from './mock';

// Platform
export {
  getPlatformAdapter,
  type PlatformAdapter,
  setPlatformAdapter,
} from './platform';
