/**
 * Re-export masto types as the source of truth for Mastodon API entities
 * These types come directly from the masto package and match the Mastodon API spec
 *
 * Masto exports types under the `mastodon.v1` namespace
 */

import type { mastodon } from 'masto';

// Core entity types - re-export from mastodon.v1 namespace
export type Account = mastodon.v1.Account;
export type AccountCredentials = mastodon.v1.AccountCredentials;
export type AccountField = mastodon.v1.AccountField;
export type AccountSource = mastodon.v1.AccountSource;

export type Status = mastodon.v1.Status;
export type StatusMention = mastodon.v1.StatusMention;
export type StatusVisibility = mastodon.v1.StatusVisibility;

export type MediaAttachment = mastodon.v1.MediaAttachment;
export type MediaAttachmentType = mastodon.v1.MediaAttachmentType;
export type MediaAttachmentMeta = mastodon.v1.MediaAttachmentMeta;

export type Notification = mastodon.v1.Notification;
export type NotificationType = mastodon.v1.NotificationType;

export type Relationship = mastodon.v1.Relationship;

export type Poll = mastodon.v1.Poll;
export type PollOption = mastodon.v1.PollOption;

export type Tag = mastodon.v1.Tag;
export type TagHistory = mastodon.v1.TagHistory;

export type CustomEmoji = mastodon.v1.CustomEmoji;

export type Instance = mastodon.v1.Instance;

export type Context = mastodon.v1.Context;

export type Conversation = mastodon.v1.Conversation;

export type Application = mastodon.v1.Application;

export type PreviewCard = mastodon.v1.PreviewCard;
export type TrendLink = mastodon.v1.TrendLink;

export type Token = mastodon.v1.Token;

// Re-export the mastodon namespace for advanced usage
export type { mastodon } from 'masto';

// Re-export client creation functions
export {
  createOAuthAPIClient,
  createRestAPIClient,
  createStreamingAPIClient,
} from 'masto';

export type ItemType = 'link' | 'book' | 'movie' | 'song';

export interface Item {
  url: string;
  type: ItemType;
  title: string;
  description?: string;
  image?: string;
  // Flat metadata — type-specific fields picked by ItemCard based on `type`
  author?: string;
  director?: string;
  artist?: string;
  album?: string;
  year?: number;
  genre?: string;
  // Link-specific (from PreviewCard data)
  provider?: string;
  blurhash?: string;
  language?: string;
}

export interface Rating {
  /** 1–5 whole stars, decimal-ready for future half-star support */
  value: number;
}

export interface FediwayStatus extends Status {
  item?: Item;
  rating?: Rating;
}

export interface ItemAggregation {
  item: Item;
  averageRating: number;
  ratingCount: number;
  /** Distribution of ratings: index 0 = 1 star, index 4 = 5 stars */
  ratingDistribution: [number, number, number, number, number];
  friendsTakes: FediwayStatus[];
  recentTakes: FediwayStatus[];
}

export interface AppRegistration {
  clientId: string;
  clientSecret: string;
}

export interface StoredInstanceInfo {
  domain: string;
  version?: string;
  streamingUrl?: string;
  maxChars?: number;
}

export interface StoredAccount {
  /** Unique key: "{domain}:{accountId}" */
  key: string;
  instanceUrl: string;
  instanceDomain: string;
  accountId: string;
  username: string;
  acct?: string;
  displayName?: string;
  avatarUrl?: string;
  appRegistration?: AppRegistration;
  instanceInfo?: StoredInstanceInfo;
}
