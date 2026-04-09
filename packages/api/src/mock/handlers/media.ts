import { delay } from '../utils';

export function createMediaHandler() {
  return {
    async create(params: { file: Blob | string; description?: string | null }) {
      await delay();
      return {
        id: `media-${Date.now()}`,
        type: 'image',
        url: typeof params.file === 'string' ? params.file : URL.createObjectURL(params.file as Blob),
        previewUrl: typeof params.file === 'string' ? params.file : URL.createObjectURL(params.file as Blob),
        description: params.description ?? null,
        meta: {},
      };
    },
  };
}
