<script setup lang="ts">
import {
  PhCamera,
  PhX,
} from '@phosphor-icons/vue';
import { useClient } from '@repo/api';
import { Button, CharacterCounter, ContentWarningToggle, ReplyContext, VisibilitySelector } from '@repo/ui';
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  VisuallyHidden,
} from 'reka-ui';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useBackButton } from '../composables/useBackButton';
import { useHaptics } from '../composables/useHaptics';
import { useKeyboard } from '../composables/useKeyboard';
import { usePostComposer } from '../composables/usePostComposer';

const { isOpen, replyingTo, close } = usePostComposer();
const { notification } = useHaptics();
const { height: keyboardHeight, init: initKeyboard } = useKeyboard();
const { register: registerBackButton } = useBackButton();

const content = ref('');
const spoilerText = ref('');
const showContentWarning = ref(false);
const visibility = ref<'public' | 'unlisted' | 'private' | 'direct'>('public');
const isSubmitting = ref(false);
const imagePreview = ref<string | null>(null);
const imageFile = ref<string | null>(null);
const textareaEl = ref<HTMLTextAreaElement>();
const showDiscardDialog = ref(false);

const CHARACTER_LIMIT = 500;

const canPost = computed(() => {
  return content.value.trim().length > 0 && content.value.length <= CHARACTER_LIMIT && !isSubmitting.value;
});

const dialogTitle = computed(() => {
  return replyingTo.value ? `Reply to @${replyingTo.value.account.acct}` : 'New post';
});

let unregisterBack: (() => void) | null = null;

watch(isOpen, async (open) => {
  if (open) {
    if (replyingTo.value) {
      content.value = `@${replyingTo.value.account.acct} `;
    }
    else {
      content.value = '';
    }
    spoilerText.value = '';
    showContentWarning.value = false;
    visibility.value = 'public';
    isSubmitting.value = false;
    imagePreview.value = null;
    imageFile.value = null;

    initKeyboard();

    // Register synchronously before any await to avoid race
    unregisterBack = registerBackButton(100, () => {
      handleClose();
      return true;
    });

    await nextTick();
    textareaEl.value?.focus();
  }
  else {
    unregisterBack?.();
    unregisterBack = null;
  }
});

onBeforeUnmount(() => {
  unregisterBack?.();
  unregisterBack = null;
});

function getClient() {
  try {
    return useClient();
  }
  catch {
    return null;
  }
}

async function handlePost() {
  if (!canPost.value)
    return;

  isSubmitting.value = true;

  const client = getClient();
  if (!client) {
    notification('error');
    isSubmitting.value = false;
    return;
  }

  try {
    await client.rest.v1.statuses.create({
      status: content.value,
      spoilerText: showContentWarning.value ? spoilerText.value : undefined,
      visibility: visibility.value,
      inReplyToId: replyingTo.value?.id,
    });
    notification('success');
    close();
  }
  catch {
    notification('error');
    isSubmitting.value = false;
  }
}

function handleClose() {
  if (content.value.trim() && !isSubmitting.value) {
    showDiscardDialog.value = true;
    return;
  }
  close();
}

function confirmDiscard() {
  showDiscardDialog.value = false;
  close();
}

async function handleCamera() {
  try {
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
    const photo = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
      width: 1920,
      height: 1920,
    });
    if (photo.webPath) {
      imagePreview.value = photo.webPath;
      imageFile.value = photo.path ?? photo.webPath;
    }
  }
  catch (err) {
    console.error('[PostComposer] Camera error:', err);
  }
}

function removeImage() {
  imagePreview.value = null;
  imageFile.value = null;
}
</script>

<template>
  <!-- Composer Dialog -->
  <DialogRoot :open="isOpen" @update:open="(val: boolean) => { if (!val) handleClose() }">
    <DialogPortal>
      <Transition
        enter-active-class="motion-safe:transition-transform motion-safe:duration-250 motion-safe:ease-out"
        enter-from-class="translate-y-full"
        leave-active-class="motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-in"
        leave-to-class="translate-y-full"
      >
        <DialogContent
          v-if="isOpen"
          class="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900"
          :style="{ paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : 'var(--safe-area-inset-bottom)' }"
          @escape-key-down.prevent="handleClose"
          @interact-outside.prevent
        >
          <VisuallyHidden>
            <DialogTitle>{{ dialogTitle }}</DialogTitle>
            <DialogDescription>Compose a new post</DialogDescription>
          </VisuallyHidden>

          <!-- Header -->
          <header
            class="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800"
            :style="{ paddingTop: 'calc(0.75rem + var(--safe-area-inset-top))' }"
          >
            <Button variant="muted" size="sm" @click="handleClose">
              Cancel
            </Button>
            <Button size="sm" :disabled="!canPost" @click="handlePost">
              {{ isSubmitting ? 'Posting...' : 'Post' }}
            </Button>
          </header>

          <!-- Reply context -->
          <ReplyContext v-if="replyingTo" :acct="replyingTo.account.acct" class="border-b border-gray-100 px-4 py-2 dark:border-gray-800" />

          <!-- Composer body -->
          <div class="flex-1 overflow-y-auto p-4">
            <!-- Content Warning Input -->
            <div v-if="showContentWarning" class="mb-3">
              <input
                v-model="spoilerText"
                type="text"
                placeholder="Write your warning here"
                class="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-hidden focus:border-blue-500 dark:border-gray-700"
                aria-label="Content warning text"
              >
            </div>

            <!-- Main Textarea -->
            <textarea
              ref="textareaEl"
              v-model="content"
              :placeholder="showContentWarning ? 'Write the content behind the warning...' : 'What\'s on your mind?'"
              class="w-full flex-1 resize-none border-none bg-transparent font-content text-[17px] leading-relaxed text-gray-900 outline-hidden placeholder-gray-400 dark:text-gray-100"
              style="min-height: 150px"
              aria-label="Post content"
              aria-describedby="char-count"
            />

            <!-- Image preview -->
            <div v-if="imagePreview" class="relative mt-3 inline-block">
              <img :src="imagePreview" class="max-h-48 rounded-xl" alt="Attached image">
              <button
                type="button"
                class="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-gray-900/70 text-white"
                aria-label="Remove attached image"
                @click="removeImage"
              >
                <PhX :size="14" />
              </button>
            </div>

            <!-- Character Count -->
            <div id="char-count" class="mt-2 flex justify-end" aria-live="polite">
              <CharacterCounter :current="content.length" :limit="CHARACTER_LIMIT" />
            </div>
          </div>

          <!-- Bottom Toolbar -->
          <div class="border-t border-gray-200 px-4 py-3 dark:border-gray-800">
            <!-- Visibility Selector -->
            <div class="mb-3">
              <VisibilitySelector v-model="visibility" />
            </div>

            <!-- Options Row -->
            <div class="flex items-center gap-3">
              <ContentWarningToggle v-model="showContentWarning" />

              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition-colors dark:bg-gray-800 dark:text-gray-400"
                @click="handleCamera"
              >
                <PhCamera :size="16" />
                <span>Photo</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Transition>
    </DialogPortal>
  </DialogRoot>

  <!-- Discard Confirmation -->
  <AlertDialogRoot v-model:open="showDiscardDialog">
    <AlertDialogPortal>
      <AlertDialogOverlay class="fixed inset-0 z-[60] bg-black/50 motion-safe:animate-in motion-safe:fade-in" />
      <AlertDialogContent class="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 dark:bg-gray-800">
        <AlertDialogTitle class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Discard post?
        </AlertDialogTitle>
        <AlertDialogDescription class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Your draft will be lost.
        </AlertDialogDescription>
        <div class="mt-4 flex justify-end gap-3">
          <AlertDialogCancel as-child>
            <Button variant="muted" size="sm">
              Keep editing
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction as-child>
            <Button variant="default" size="sm" class="bg-red-600 hover:bg-red-700" @click="confirmDiscard">
              Discard
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
