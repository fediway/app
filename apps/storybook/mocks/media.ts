import type { MediaAttachment } from '@repo/types';

let counter = 0;

function nextId(overrideId?: string): string {
  counter++;
  return overrideId ?? String(counter);
}

function imageMeta(w: number, h: number, focus?: { x: number; y: number }) {
  const aspect = w / h;
  const sw = 400;
  const sh = Math.round(sw / aspect);
  return {
    original: { width: w, height: h, size: `${w}x${h}`, aspect },
    small: { width: sw, height: sh, size: `${sw}x${sh}`, aspect },
    focus: focus ?? null,
    colors: null,
  };
}

export function createMockAttachment(
  type: 'image' | 'video' | 'audio' | 'gifv' = 'image',
  overrides?: Partial<MediaAttachment>,
): MediaAttachment {
  const id = nextId(overrides?.id);

  const base = {
    id,
    type,
    url: `https://picsum.photos/seed/media${id}/800/600`,
    previewUrl: `https://picsum.photos/seed/media${id}/400/300`,
    remoteUrl: null,
    meta: imageMeta(800, 600),
    description: `A sample ${type} attachment`,
    blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
    textUrl: null,
  };

  return { ...base, ...overrides } as MediaAttachment;
}

export function createPortraitAttachment(id?: string, overrides?: Partial<MediaAttachment>): MediaAttachment {
  const resolvedId = nextId(id);
  return createMockAttachment('image', {
    id: resolvedId,
    url: `https://picsum.photos/seed/portrait${resolvedId}/800/1200`,
    previewUrl: `https://picsum.photos/seed/portrait${resolvedId}/267/400`,
    meta: imageMeta(800, 1200),
    description: 'A portrait photo',
    ...overrides,
  });
}

export function createPanoramaAttachment(id?: string, overrides?: Partial<MediaAttachment>): MediaAttachment {
  const resolvedId = nextId(id);
  return createMockAttachment('image', {
    id: resolvedId,
    url: `https://picsum.photos/seed/pano${resolvedId}/2400/600`,
    previewUrl: `https://picsum.photos/seed/pano${resolvedId}/400/100`,
    meta: imageMeta(2400, 600),
    description: 'A panoramic photo',
    ...overrides,
  });
}

export function createFocalPointAttachment(id?: string, focusX = 0.5, focusY = -0.5, overrides?: Partial<MediaAttachment>): MediaAttachment {
  const resolvedId = nextId(id);
  return createMockAttachment('image', {
    id: resolvedId,
    url: `https://picsum.photos/seed/focal${resolvedId}/800/600`,
    previewUrl: `https://picsum.photos/seed/focal${resolvedId}/400/300`,
    meta: imageMeta(800, 600, { x: focusX, y: focusY }),
    description: `Focal point at ${focusX}, ${focusY}`,
    ...overrides,
  });
}

export function createVideoAttachment(id?: string, overrides?: Partial<MediaAttachment>): MediaAttachment {
  const resolvedId = nextId(id);
  return createMockAttachment('video', {
    id: resolvedId,
    url: `https://picsum.photos/seed/video${resolvedId}/800/600`,
    previewUrl: `https://picsum.photos/seed/video${resolvedId}/400/300`,
    meta: {
      original: { width: 1920, height: 1080, size: '1920x1080', aspect: 16 / 9, frameRate: '30/1', duration: 42.5, bitrate: 2_500_000 },
      small: { width: 400, height: 225, size: '400x225', aspect: 16 / 9, frameRate: '30/1', duration: 42.5, bitrate: 2_500_000 },
      focus: null,
      colors: null,
    },
    description: 'A sample video',
    ...overrides,
  });
}

export function createGifvAttachment(id?: string, overrides?: Partial<MediaAttachment>): MediaAttachment {
  const resolvedId = nextId(id);
  return createMockAttachment('gifv', {
    id: resolvedId,
    url: `https://picsum.photos/seed/gifv${resolvedId}/400/400`,
    previewUrl: `https://picsum.photos/seed/gifv${resolvedId}/400/400`,
    meta: imageMeta(400, 400),
    description: 'An animated GIF',
    ...overrides,
  });
}

export function createAudioAttachment(id?: string, overrides?: Partial<MediaAttachment>): MediaAttachment {
  const resolvedId = nextId(id);
  return createMockAttachment('audio', {
    id: resolvedId,
    url: '',
    previewUrl: '',
    meta: null,
    description: 'A podcast episode',
    ...overrides,
  });
}

export function createAttachmentWithoutPreview(id?: string, overrides?: Partial<MediaAttachment>): MediaAttachment {
  const resolvedId = nextId(id);
  return createMockAttachment('image', {
    id: resolvedId,
    url: `https://picsum.photos/seed/noprev${resolvedId}/800/600`,
    previewUrl: '',
    meta: imageMeta(800, 600),
    description: 'Image without preview',
    blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
    ...overrides,
  });
}
