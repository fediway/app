import type { MastoClient, MastoClientConfig } from './client';
import { createMastoClient } from './client';
import { createMockClient } from './mock/client';

export interface CreateClientConfig extends MastoClientConfig {
  mock?: boolean;
}

export function createClient(config: CreateClientConfig): MastoClient {
  if (config.mock) {
    return createMockClient();
  }
  return createMastoClient(config);
}
