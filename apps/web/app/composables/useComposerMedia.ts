import type { MediaItem } from '@repo/ui';
import { useClient } from '@repo/api';
import { ref } from 'vue';

const MAX_MEDIA = 4;

export function useComposerMedia() {
  const media = ref<MediaItem[]>([]);
  const altEditIndex = ref(-1);

  async function uploadMedia(item: MediaItem) {
    try {
      const client = useClient();
      item.progress = 50;

      const attachment = await client.rest.v2.media.create({
        file: item.file!,
        skipPolling: true,
      });

      item.id = attachment.id;
      item.progress = 100;
      item.status = 'complete';
    }
    catch (err) {
      console.error('[Compose] Media upload failed:', err);
      item.status = 'error';
      item.progress = 0;
    }
  }

  function addMediaFiles(files: File[] | FileList) {
    for (const file of Array.from(files)) {
      if (media.value.length >= MAX_MEDIA)
        break;

      const previewUrl = URL.createObjectURL(file);
      const item: MediaItem = {
        file,
        previewUrl,
        altText: '',
        progress: 0,
        status: 'uploading',
        type: file.type.startsWith('video') ? 'video' : 'image',
      };
      media.value.push(item);
      uploadMedia(item);
    }
  }

  function handleAddMedia() {
    if (media.value.length >= MAX_MEDIA)
      return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/mp4,video/webm';
    input.multiple = true;
    input.onchange = () => {
      if (input.files)
        addMediaFiles(input.files);
    };
    input.click();
  }

  function handleRemoveMedia(index: number) {
    const item = media.value[index];
    if (item?.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
    media.value.splice(index, 1);
  }

  function handleRetryMedia(index: number) {
    const item = media.value[index];
    if (item?.file) {
      item.status = 'uploading';
      item.progress = 0;
      uploadMedia(item);
    }
  }

  function handleEditAlt(index: number) {
    altEditIndex.value = index;
  }

  function handleAltSave(value: string) {
    const item = media.value[altEditIndex.value];
    if (item) {
      item.altText = value;
      if (item.id) {
        const client = useClient();
        fetch(`${client.config.url}/api/v1/media/${item.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${client.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ description: value }),
        }).catch(() => {});
      }
    }
    altEditIndex.value = -1;
  }

  function handlePasteMedia(files: File[]) {
    if (media.value.length < MAX_MEDIA)
      addMediaFiles(files);
  }

  function revokeAllPreviews() {
    for (const item of media.value) {
      if (item.previewUrl)
        URL.revokeObjectURL(item.previewUrl);
    }
  }

  function reset() {
    media.value = [];
    altEditIndex.value = -1;
  }

  return {
    media,
    altEditIndex,
    MAX_MEDIA,
    addMediaFiles,
    handleAddMedia,
    handleRemoveMedia,
    handleRetryMedia,
    handleEditAlt,
    handleAltSave,
    handlePasteMedia,
    revokeAllPreviews,
    reset,
  };
}
