<script setup lang="ts">
import type { Status } from '@repo/types';
import { PhX } from '@phosphor-icons/vue';
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
import { computed, ref } from 'vue';
import { useComposerDraft } from '~/composables/useComposerDraft';
import { useComposerMedia } from '~/composables/useComposerMedia';
import { useComposerSearch } from '~/composables/useComposerSearch';

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

const editorRef = ref<InstanceType<typeof ComposeTextarea>>();

const spoilerText = ref('');
const showContentWarning = ref(false);
const visibility = ref<'public' | 'unlisted' | 'private' | 'direct'>('public');
const isSubmitting = ref(false);
const errorMessage = ref('');

const showPoll = ref(false);
const pollOptions = ref(['', '']);
const pollMultiple = ref(false);
const pollDuration = ref(86400);

const showDiscardConfirm = ref(false);

const CHARACTER_LIMIT = 500;

const {
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
  reset: resetMedia,
} = useComposerMedia();

const { allEmoji, searchMentions, searchHashtags, searchEmoji } = useComposerSearch(
  () => props.isOpen,
);

const dropZoneRef = ref<HTMLElement>();
const { isOverDropZone } = useDropZone(dropZoneRef, {
  dataTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'],
  onDrop(files) {
    if (files)
      addMediaFiles(files);
  },
});

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

const { draftStatus, saveDraft, flushDraft, discardDraft } = useComposerDraft({
  isOpen: () => props.isOpen,
  replyTo: () => props.replyTo,
  editorRef,
  spoilerText,
  showContentWarning,
  visibility,
  showPoll,
  pollOptions,
  pollDuration,
  pollMultiple,
  hasUnsavedContent: () => hasUnsavedContent.value,
  onResetMedia() {
    revokeAllPreviews();
    resetMedia();
  },
});

async function handlePost() {
  if (!canPost.value)
    return;

  isSubmitting.value = true;
  errorMessage.value = '';

  await flushDraft();

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
    await discardDraft();
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
  discardDraft();
  showDiscardConfirm.value = false;
  emit('close');
}
</script>

<template>
  <!-- Compose Dialog -->
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent size="lg" :show-close="false" full-screen-mobile>
      <div ref="dropZoneRef" class="flex h-full flex-col" :class="{ 'ring-2 ring-ring ring-inset': isOverDropZone }">
        <VisuallyHidden>
          <DialogTitle>{{ replyTo ? 'Write a reply' : 'New post' }}</DialogTitle>
          <DialogDescription>Compose and publish a post</DialogDescription>
        </VisuallyHidden>

        <!-- Header -->
        <header class="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <Button variant="muted" size="sm" @click="handleClose">
            Cancel
          </Button>
          <div class="flex items-center gap-3">
            <span v-if="draftStatus === 'saved'" class="text-xs text-muted-foreground-subtle">Draft saved</span>
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
            class="flex-1 overflow-y-auto p-4"
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
        <div class="mt-auto border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
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
