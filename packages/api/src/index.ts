// Auth utilities
export { discoverInstance, type InstanceInfo, normalizeInstanceUrl } from './auth/instance-discovery';

// Multi-account storage
export { loadAccountList, loadActiveAccountKey, scopedStorageKey } from './auth/storage';

// Client
export { createMastoClient, type MastoClient, type MastoClientConfig } from './client';

// Composables
export * from './composables';

// Errors
export {
  FediwayAPIError,
  FediwayNetworkError,
  isFediwayAPIError,
  isFediwayNetworkError,
} from './errors';

// Fediway API
export { createFediwayAPI, type CreateStatusParams, type FediwayAPI, type GetItemStatusesOptions } from './fediway-api';

// Platform
export {
  getPlatformAdapter,
  type PlatformAdapter,
  setPlatformAdapter,
} from './platform';
