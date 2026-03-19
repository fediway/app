import type { PreviewCard } from '@repo/types';

export function createMockPreviewCard(overrides?: Partial<PreviewCard>): PreviewCard {
  const base = {
    url: 'https://example.com/article',
    title: 'Scientists discover high-temperature superconductor at room pressure',
    description: 'A breakthrough in materials science could revolutionize energy transmission and computing.',
    type: 'link' as const,
    authorName: '',
    authorUrl: '',
    providerName: 'Example News',
    providerUrl: 'https://example.com',
    html: '',
    width: 400,
    height: 200,
    image: 'https://picsum.photos/seed/card/400/200',
    embedUrl: '',
    blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
  };

  return { ...base, ...overrides } as PreviewCard;
}
