import type { MediaAttachment } from '@repo/types';

let counter = 0;

export function createMockAttachment(type: 'image' | 'video' | 'audio' | 'gifv' = 'image', overrides?: Partial<MediaAttachment>): MediaAttachment {
  counter++;
  const id = overrides?.id ?? String(counter);

  const base = {
    id,
    type,
    url: `https://picsum.photos/seed/media${id}/800/600`,
    previewUrl: `https://picsum.photos/seed/media${id}/400/300`,
    remoteUrl: null,
    meta: null,
    description: `A sample ${type} attachment`,
    blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
    textUrl: null,
  };

  return { ...base, ...overrides } as MediaAttachment;
}
