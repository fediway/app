import type { Item } from '@repo/types';

/**
 * Maps a Mastodon PreviewCard to a Fediway Item.
 * Used as a bridge until the native Item API ships.
 * The PreviewCard contains OG metadata (title, description, image, provider)
 * which maps directly to Item's link-type fields.
 */
export function previewCardToItem(card: {
  url: string;
  title: string;
  description?: string | null;
  image?: string | null;
  providerName?: string | null;
  blurhash?: string | null;
  language?: string | null;
  authorName?: string | null;
  authors?: { name: string }[];
}): Item {
  return {
    url: card.url,
    type: 'link',
    title: card.title,
    description: card.description || undefined,
    image: card.image || undefined,
    provider: card.providerName || undefined,
    blurhash: card.blurhash || undefined,
    language: card.language || undefined,
    author: card.authors?.[0]?.name || card.authorName || undefined,
  };
}
