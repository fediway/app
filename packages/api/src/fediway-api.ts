import type { FediwayStatus, ItemAggregation } from '@repo/types';
import { request } from './utils/request';

export interface CreateStatusParams {
  status: string;
  visibility?: 'public' | 'unlisted' | 'private' | 'direct';
  itemUrl?: string;
  itemType?: string;
  rating?: number;
}

export interface GetItemStatusesOptions {
  limit?: number;
  maxId?: string;
}

export interface FediwayAPI {
  createStatus: (params: CreateStatusParams) => Promise<FediwayStatus>;
  getItem: (url: string) => Promise<ItemAggregation>;
  getItemStatuses: (url: string, opts?: GetItemStatusesOptions) => Promise<FediwayStatus[]>;
}

export function createFediwayAPI(baseUrl: string, getToken: () => string | null): FediwayAPI {
  function buildUrl(path: string): string {
    return `${baseUrl}/api/fediway/v1${path}`;
  }

  function tokenOrThrow(): string {
    const token = getToken();
    if (!token)
      throw new Error('Not authenticated');
    return token;
  }

  return {
    async createStatus(params: CreateStatusParams): Promise<FediwayStatus> {
      return request<FediwayStatus>(buildUrl('/statuses'), {
        method: 'POST',
        body: params,
        token: tokenOrThrow(),
      });
    },

    async getItem(url: string): Promise<ItemAggregation> {
      const encoded = encodeURIComponent(url);
      return request<ItemAggregation>(buildUrl(`/items/lookup?url=${encoded}`), {
        token: getToken() ?? undefined,
      });
    },

    async getItemStatuses(url: string, opts: GetItemStatusesOptions = {}): Promise<FediwayStatus[]> {
      const params = new URLSearchParams({ url });
      if (opts.limit)
        params.set('limit', String(opts.limit));
      if (opts.maxId)
        params.set('max_id', opts.maxId);
      return request<FediwayStatus[]>(buildUrl(`/items/statuses?${params}`), {
        token: getToken() ?? undefined,
      });
    },
  };
}
