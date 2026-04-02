import type { mastodon } from 'masto';
import type { FediwayAPI } from './fediway-api';
import { createRestAPIClient, createStreamingAPIClient } from 'masto';
import { createFediwayAPI } from './fediway-api';
import { patchRelativeLinkHeaders } from './utils/patch-masto-paginator';

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
patchRelativeLinkHeaders();

export function createMastoClient(config: MastoClientConfig): MastoClient {
  const rest = createRestAPIClient({
    url: config.url,
    accessToken: config.accessToken,
  });

  // Streaming client is lazy — only created when first accessed.
  // Prevents WebSocket connection spam when streaming isn't used.
  let streaming: mastodon.streaming.Client | undefined;
  let streamingInitialized = false;

  function getStreaming(): mastodon.streaming.Client | undefined {
    if (!streamingInitialized && config.accessToken) {
      streamingInitialized = true;
      streaming = createStreamingAPIClient({
        streamingApiUrl: `${config.url}/api/v1/streaming`,
        accessToken: config.accessToken,
      });
    }
    return streaming;
  }

  const fediway = createFediwayAPI(config.url, () => config.accessToken ?? null);

  return {
    rest,
    get streaming() { return getStreaming(); },
    fediway,
    config,
    isAuthenticated: !!config.accessToken,
  };
}
