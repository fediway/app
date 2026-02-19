import type { mastodon } from 'masto';
import type { FediwayAPI } from './fediway-api';
import { createRestAPIClient, createStreamingAPIClient } from 'masto';
import { createFediwayAPI } from './fediway-api';

export interface MastoClientConfig {
  /** Instance URL (e.g., 'https://mastodon.social') */
  url: string;
  /** Access token for authenticated requests */
  accessToken?: string;
}

export interface MastoClient {
  /** REST API client for standard API calls */
  rest: mastodon.rest.Client;
  /** Streaming API client for real-time updates (only available when authenticated) */
  streaming?: mastodon.streaming.Client;
  /** Fediway-specific API client */
  fediway: FediwayAPI;
  /** Current configuration */
  config: MastoClientConfig;
  /** Whether the client is authenticated */
  isAuthenticated: boolean;
}

/**
 * Creates a Mastodon API client with Fediway extensions
 */
export function createMastoClient(config: MastoClientConfig): MastoClient {
  const rest = createRestAPIClient({
    url: config.url,
    accessToken: config.accessToken,
  });

  let streaming: mastodon.streaming.Client | undefined;

  // Only create streaming client if authenticated
  if (config.accessToken) {
    streaming = createStreamingAPIClient({
      streamingApiUrl: `${config.url}/api/v1/streaming`,
      accessToken: config.accessToken,
    });
  }

  const fediway = createFediwayAPI(config.url, () => config.accessToken ?? null);

  return {
    rest,
    streaming,
    fediway,
    config,
    isAuthenticated: !!config.accessToken,
  };
}
