<script setup lang="ts">
import type { Status } from '@repo/types';
import type { MediaItem } from '@repo/ui';
import { PhX } from '@phosphor-icons/vue';
import { useClient, useDraft } from '@repo/api';
import {
  AltTextModal,
  Button,
  CharacterCounter,
  ComposeTextarea,
  ComposeToolbar,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  EmojiPickerButton,
  Input,
  MediaPreviewGrid,
  PollEditor,
  ReplyContext,
  VisibilitySelector,
} from '@repo/ui';
import { useDropZone } from '@vueuse/core';
import { VisuallyHidden } from 'reka-ui';
import { computed, nextTick, ref, watch } from 'vue';
import { useSettings } from '~/composables/useSettings';
import { useNavigationStore } from '~/stores/navigation';

interface Props {
  isOpen: boolean;
  replyTo?: Status | null;
}

interface PollData {
  options: string[];
  expiresIn: number;
  multiple: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  replyTo: null,
});

const emit = defineEmits<{
  close: [];
  post: [data: { content: string; spoilerText: string; visibility: string; poll?: PollData; mediaIds?: string[]; idempotencyKey?: string }];
}>();

const { settings: appSettings } = useSettings();
const navigation = useNavigationStore();

// Draft persistence — keyed by account + reply context
const draftKey = computed(() => {
  const acct = navigation.currentUser?.acct ?? 'anon';
  return props.replyTo ? `${acct}:reply:${props.replyTo.id}` : acct;
});
const draft = useDraft(draftKey.value);

// Editor ref (imperative API — no v-model)
const editorRef = ref<InstanceType<typeof ComposeTextarea>>();

// Post content
const spoilerText = ref('');
const showContentWarning = ref(false);
const visibility = ref<'public' | 'unlisted' | 'private' | 'direct'>('public');
const isSubmitting = ref(false);
const draftStatus = ref<'idle' | 'saving' | 'saved'>('idle');
const errorMessage = ref('');

// Poll state
const showPoll = ref(false);
const pollOptions = ref(['', '']);
const pollMultiple = ref(false);
const pollDuration = ref(86400);

// Media state
const media = ref<MediaItem[]>([]);
const altEditIndex = ref(-1);
const MAX_MEDIA = 4;

// Discard confirmation
const showDiscardConfirm = ref(false);

const CHARACTER_LIMIT = 500;

// Drag-and-drop zone on entire modal
const dropZoneRef = ref<HTMLElement>();
const { isOverDropZone } = useDropZone(dropZoneRef, {
  dataTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'],
  onDrop(files) {
    if (files)
      addMediaFiles(files);
  },
});

// Media + poll mutual exclusion
const canAddMedia = computed(() => !showPoll.value && media.value.length < MAX_MEDIA);
const canTogglePoll = computed(() => media.value.length === 0);

const editorCharCount = computed(() => editorRef.value?.characterCount ?? 0);
const editorIsEmpty = computed(() => editorRef.value?.isEmpty ?? true);

const canPost = computed(() => {
  const hasContent = !editorIsEmpty.value;
  const hasMedia = media.value.length > 0;
  const underLimit = editorCharCount.value <= CHARACTER_LIMIT;
  const pollValid = !showPoll.value || pollOptions.value.filter(o => o.trim()).length >= 2;
  const mediaReady = media.value.every(m => m.status !== 'uploading');
  return (hasContent || hasMedia) && underLimit && !isSubmitting.value && pollValid && mediaReady;
});

const hasUnsavedContent = computed(() =>
  !editorIsEmpty.value || media.value.length > 0,
);

// ── Media Upload ──

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

async function uploadMedia(item: MediaItem) {
  try {
    const client = useClient();
    item.progress = 50; // Indeterminate progress (masto lib doesn't expose upload progress)

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

function handleAddMedia() {
  if (!canAddMedia.value)
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
    // Update alt text on server if already uploaded
    if (item.id) {
      const client = useClient();
      fetch(`${client.config.url}/api/v1/media/${item.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${client.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: value }),
      }).catch(() => {
        // Alt text update failed — not critical, don't block
      });
    }
  }
  altEditIndex.value = -1;
}

// ── Paste-to-upload (from ComposeTextarea) ──

function handlePasteMedia(files: File[]) {
  if (canAddMedia.value)
    addMediaFiles(files);
}

// ── Autocomplete search (injected into ComposeTextarea) ──

let mentionDebounce: ReturnType<typeof setTimeout>;
async function searchMentions(query: string) {
  clearTimeout(mentionDebounce);
  return new Promise<any[]>((resolve) => {
    mentionDebounce = setTimeout(async () => {
      try {
        const client = useClient();
        const results = await client.rest.v2.search.list({ q: query, type: 'accounts', limit: 8, resolve: true });
        resolve(results.accounts.map(a => ({
          id: a.acct,
          acct: a.acct,
          displayName: a.displayName || a.username,
          avatar: a.avatar,
        })));
      }
      catch {
        resolve([]);
      }
    }, 250);
  });
}

let hashtagDebounce: ReturnType<typeof setTimeout>;
async function searchHashtags(query: string) {
  clearTimeout(hashtagDebounce);
  return new Promise<any[]>((resolve) => {
    hashtagDebounce = setTimeout(async () => {
      try {
        const client = useClient();
        const results = await client.rest.v2.search.list({ q: query, type: 'hashtags', limit: 8 });
        resolve(results.hashtags.map(t => ({
          name: t.name,
          postCount: t.history?.[0]?.uses ? Number(t.history[0].uses) : undefined,
        })));
      }
      catch {
        resolve([]);
      }
    }, 250);
  });
}

// Cache instance custom emoji (fetched once per session)
let cachedCustomEmoji: any[] | null = null;

async function loadCustomEmoji() {
  if (cachedCustomEmoji)
    return cachedCustomEmoji;
  try {
    const client = useClient();
    const emoji = await client.rest.v1.customEmojis.list();
    cachedCustomEmoji = emoji
      .filter(e => e.visibleInPicker)
      .map(e => ({
        shortcode: e.shortcode,
        url: e.staticUrl || e.url,
        category: e.category || 'Custom',
      }));
    return cachedCustomEmoji;
  }
  catch {
    return [];
  }
}

async function searchEmoji(query: string) {
  const custom = await loadCustomEmoji();
  const q = query.toLowerCase();
  return custom
    .filter(e => e.shortcode.toLowerCase().includes(q))
    .slice(0, 10);
}

// All emoji for the browsable picker (loaded when picker opens)
const allEmoji = ref<any[]>([]);

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && allEmoji.value.length === 0) {
    allEmoji.value = await loadCustomEmoji();
  }
}, { immediate: false });

// ── Draft autosave ──

function saveDraft() {
  if (!props.isOpen || !hasUnsavedContent.value)
    return;
  draftStatus.value = 'saving';
  draft.save({
    content: editorRef.value?.getPlainText() ?? '',
    spoilerText: spoilerText.value,
    visibility: visibility.value,
    inReplyToId: props.replyTo?.id,
    ...(showPoll.value
      ? {
          pollOptions: pollOptions.value,
          pollDuration: pollDuration.value,
          pollMultiple: pollMultiple.value,
        }
      : {}),
  });
  setTimeout(() => {
    if (draftStatus.value === 'saving')
      draftStatus.value = 'saved';
  }, 1200);
}

watch([spoilerText, visibility, pollOptions, pollDuration, pollMultiple, showPoll], saveDraft);

// ── Reset form on open ──

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    spoilerText.value = '';
    showContentWarning.value = false;
    visibility.value = appSettings.privacy.defaultVisibility;
    isSubmitting.value = false;
    showPoll.value = false;
    pollOptions.value = ['', ''];
    pollMultiple.value = false;
    pollDuration.value = 86400;
    showDiscardConfirm.value = false;
    draftStatus.value = 'idle';
    errorMessage.value = '';
    media.value = [];
    altEditIndex.value = -1;

    // Wait for editor to mount, then restore content
    await nextTick();

    const saved = await draft.load();
    if (saved && saved.content.trim()) {
      editorRef.value?.setContent(saved.content);
      spoilerText.value = saved.spoilerText;
      showContentWarning.value = saved.spoilerText.length > 0;
      visibility.value = saved.visibility;
      if (saved.pollOptions && saved.pollOptions.length >= 2) {
        showPoll.value = true;
        pollOptions.value = saved.pollOptions;
        pollDuration.value = saved.pollDuration ?? 86400;
        pollMultiple.value = saved.pollMultiple ?? false;
      }
      draftStatus.value = 'saved';
    }
    else if (props.replyTo) {
      editorRef.value?.setContent(`@${props.replyTo.account.acct} `);
    }
    else {
      editorRef.value?.clear();
    }

    // Focus the editor
    editorRef.value?.focus();
  }
  else {
    // Clean up object URLs on close
    for (const item of media.value) {
      if (item.previewUrl)
        URL.revokeObjectURL(item.previewUrl);
    }
  }
});

// ── Submission (don't dismiss until API confirms) ──

async function handlePost() {
  if (!canPost.value)
    return;

  isSubmitting.value = true;
  errorMessage.value = '';

  // Safety net: save draft before submission
  await draft.flush();

  const postData: { content: string; spoilerText: string; visibility: string; poll?: PollData; mediaIds?: string[]; idempotencyKey?: string } = {
    content: editorRef.value?.getPlainText() ?? '',
    spoilerText: showContentWarning.value ? spoilerText.value : '',
    visibility: visibility.value,
    idempotencyKey: crypto.randomUUID(),
  };

  const validOptions = pollOptions.value.filter(o => o.trim());
  if (showPoll.value && validOptions.length >= 2) {
    postData.poll = {
      options: validOptions,
      expiresIn: pollDuration.value,
      multiple: pollMultiple.value,
    };
  }

  const mediaIds = media.value
    .filter(m => m.id && m.status === 'complete')
    .map(m => m.id!);
  if (mediaIds.length > 0) {
    postData.mediaIds = mediaIds;
  }

  try {
    emit('post', postData);
    await draft.discard();
    emit('close');
  }
  catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to post. Please try again.';
    isSubmitting.value = false;
  }
}

function handleClose() {
  if (hasUnsavedContent.value) {
    showDiscardConfirm.value = true;
    return;
  }
  emit('close');
}

function handleOpenChange(open: boolean) {
  if (!open) {
    handleClose();
  }
}

function confirmDiscard() {
  draft.discard();
  showDiscardConfirm.value = false;
  emit('close');
}
</script>

<template>
  <!-- Compose Dialog -->
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent size="lg" :show-close="false">
      <div ref="dropZoneRef" :class="{ 'ring-2 ring-ring ring-inset': isOverDropZone }">
        <VisuallyHidden>
          <DialogTitle>{{ replyTo ? 'Write a reply' : 'New post' }}</DialogTitle>
          <DialogDescription>Compose and publish a post</DialogDescription>
        </VisuallyHidden>

        <!-- Header -->
        <header class="flex items-center justify-between border-b border-border px-4 py-3">
          <Button variant="muted" size="sm" @click="handleClose">
            Cancel
          </Button>
          <div class="flex items-center gap-3">
            <span v-if="draftStatus === 'saved'" class="text-xs text-muted-foreground/70">Draft saved</span>
            <Button size="sm" :disabled="!canPost" @click="handlePost">
              {{ isSubmitting ? 'Posting...' : 'Post' }}
            </Button>
          </div>
        </header>

        <!-- Error message -->
        <div
          v-if="errorMessage"
          role="alert"
          class="mx-4 mt-3 rounded-xl border border-red-200 bg-red-background p-3 text-sm text-red"
        >
          {{ errorMessage }}
        </div>

        <!-- Reply context -->
        <ReplyContext v-if="replyTo" :acct="replyTo.account.acct" class="px-4 pt-3" />

        <!-- Content warning input -->
        <div v-if="showContentWarning" class="px-4 pt-3">
          <Input v-model="spoilerText" placeholder="Write your warning here" />
        </div>

        <!-- Compose area (Tiptap editor) -->
        <ClientOnly>
          <ComposeTextarea
            ref="editorRef"
            :placeholder="showContentWarning ? 'Write the content behind the warning...' : 'What\'s on your mind?'"
            :limit="CHARACTER_LIMIT"
            :disabled="isSubmitting"
            :search-mentions="searchMentions"
            :search-hashtags="searchHashtags"
            :search-emoji="searchEmoji"
            :reply-to-acct="replyTo?.account.acct"
            class="p-4"
            @submit="handlePost"
            @paste-media="handlePasteMedia"
            @update="saveDraft"
          />
        </ClientOnly>

        <!-- Media preview -->
        <MediaPreviewGrid
          v-if="media.length > 0"
          :media="media"
          :max-items="MAX_MEDIA"
          :disabled="isSubmitting"
          class="px-4 pb-3"
          @remove="handleRemoveMedia"
          @edit-alt="handleEditAlt"
          @retry="handleRetryMedia"
        />

        <!-- Poll editor -->
        <div v-if="showPoll" class="px-4 pb-3">
          <PollEditor
            :options="pollOptions"
            :duration="pollDuration"
            :multiple="pollMultiple"
            @update:options="pollOptions = $event"
            @update:duration="pollDuration = $event"
            @update:multiple="pollMultiple = $event"
          >
            <template #close>
              <button
                type="button"
                class="text-muted-foreground/70 transition-colors hover:text-muted-foreground"
                @click="showPoll = false"
              >
                <PhX :size="20" />
              </button>
            </template>
          </PollEditor>
        </div>

        <!-- Bottom toolbar -->
        <div class="border-t border-border px-4 py-3">
          <div class="mb-4">
            <label class="mb-2 block text-xs font-medium text-muted-foreground">Visibility</label>
            <VisibilitySelector v-model="visibility" />
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <ComposeToolbar
                :show-content-warning="showContentWarning"
                :show-poll="showPoll"
                :disable-poll="!canTogglePoll"
                :disable-media="!canAddMedia"
                @update:show-content-warning="showContentWarning = $event"
                @toggle-poll="canTogglePoll && (showPoll = !showPoll)"
                @add-media="handleAddMedia"
              />
              <EmojiPickerButton
                :emoji="allEmoji"
                :disabled="isSubmitting"
                @select="editorRef?.insertText($event)"
              />
            </div>
            <CharacterCounter :current="editorCharCount" :limit="CHARACTER_LIMIT" />
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>

  <!-- Alt text editor -->
  <AltTextModal
    v-if="altEditIndex >= 0 && media[altEditIndex]"
    :is-open="altEditIndex >= 0"
    :image-url="media[altEditIndex]!.previewUrl"
    :alt-text="media[altEditIndex]!.altText"
    @update:alt-text="handleAltSave"
    @close="altEditIndex = -1"
  />

  <!-- Discard confirmation -->
  <Dialog v-model:open="showDiscardConfirm">
    <DialogContent size="sm">
      <div class="p-6">
        <DialogTitle>Discard post?</DialogTitle>
        <DialogDescription class="mt-2">
          Your draft will be lost if you close now.
        </DialogDescription>
      </div>
      <DialogFooter>
        <Button variant="muted" size="sm" @click="showDiscardConfirm = false">
          Keep editing
        </Button>
        <Button size="sm" class="bg-red-600 text-white hover:bg-red-700" @click="confirmDiscard">
          Discard
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
