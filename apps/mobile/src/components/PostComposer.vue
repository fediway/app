<script setup lang="ts">
import {
  PhCamera,
  PhChatCircle,
  PhEnvelope,
  PhGlobe,
  PhLock,
  PhLockOpen,
  PhWarning,
  PhX,
} from '@phosphor-icons/vue';
import { useClient } from '@repo/api';
import { Button } from '@repo/ui';
import { computed, nextTick, ref, watch } from 'vue';
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

const CHARACTER_LIMIT = 500;

const characterCount = computed(() => content.value.length);
const charactersRemaining = computed(() => CHARACTER_LIMIT - characterCount.value);
const isOverLimit = computed(() => charactersRemaining.value < 0);

const canPost = computed(() => {
  return content.value.trim().length > 0 && !isOverLimit.value && !isSubmitting.value;
});

const visibilityOptions = [
  { value: 'public' as const, label: 'Public', icon: PhGlobe },
  { value: 'unlisted' as const, label: 'Unlisted', icon: PhLockOpen },
  { value: 'private' as const, label: 'Followers', icon: PhLock },
  { value: 'direct' as const, label: 'Direct', icon: PhEnvelope },
];

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
    await notification('success');
    close();
  }
  catch (err) {
    console.error('[PostComposer] Failed to post:', err);
    await notification('error');
    isSubmitting.value = false;
  }
}

function handleClose() {
  if (content.value.trim() && !isSubmitting.value) {
    // eslint-disable-next-line no-alert
    if (!confirm('Discard this post?'))
      return;
  }
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
  <Teleport to="body">
    <Transition name="compose">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900"
        :style="{ paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : 'var(--safe-area-inset-bottom)' }"
      >
        <!-- Header -->
        <header
          class="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800"
          :style="{ paddingTop: 'calc(0.75rem + var(--safe-area-inset-top))' }"
        >
          <Button
            variant="muted"
            size="sm"
            @click="handleClose"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            :disabled="!canPost"
            @click="handlePost"
          >
            {{ isSubmitting ? 'Posting...' : 'Post' }}
          </Button>
        </header>

        <!-- Reply context -->
        <div v-if="replyingTo" class="flex items-center gap-2 border-b border-gray-100 px-4 py-2 text-sm text-gray-500 dark:border-gray-800">
          <PhChatCircle :size="16" />
          <span>Replying to <strong class="text-gray-700 dark:text-gray-300">@{{ replyingTo.account.acct }}</strong></span>
        </div>

        <!-- Composer body -->
        <div class="flex-1 overflow-y-auto p-4">
          <!-- Content Warning Input -->
          <div v-if="showContentWarning" class="mb-3">
            <input
              v-model="spoilerText"
              type="text"
              placeholder="Write your warning here"
              class="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-hidden focus:border-blue-500 dark:border-gray-700"
            >
          </div>

          <!-- Main Textarea -->
          <textarea
            ref="textareaEl"
            v-model="content"
            :placeholder="showContentWarning ? 'Write the content behind the warning...' : 'What\'s on your mind?'"
            class="w-full flex-1 resize-none border-none bg-transparent text-[17px] leading-relaxed text-gray-900 outline-hidden placeholder-gray-400 dark:text-gray-100"
            style="min-height: 150px"
          />

          <!-- Image preview -->
          <div v-if="imagePreview" class="relative mt-3 inline-block">
            <img :src="imagePreview" class="max-h-48 rounded-xl" alt="Attached image">
            <button
              type="button"
              class="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-gray-900/70 text-white"
              @click="removeImage"
            >
              <PhX :size="14" />
            </button>
          </div>

          <!-- Character Count -->
          <div class="mt-2 flex justify-end">
            <span
              class="text-sm"
              :class="[
                isOverLimit ? 'font-medium text-red-500' : charactersRemaining <= 50 ? 'text-orange-500' : 'text-gray-400',
              ]"
            >
              {{ charactersRemaining }}
            </span>
          </div>
        </div>

        <!-- Bottom Toolbar -->
        <div class="border-t border-gray-200 px-4 py-3 dark:border-gray-800">
          <!-- Visibility Selector -->
          <div class="mb-3 flex flex-wrap gap-2">
            <button
              v-for="option in visibilityOptions"
              :key="option.value"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors"
              :class="[
                visibility === option.value
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
              ]"
              @click="visibility = option.value"
            >
              <component :is="option.icon" :size="16" />
              <span>{{ option.label }}</span>
            </button>
          </div>

          <!-- Options Row -->
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors"
              :class="[
                showContentWarning
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
              ]"
              @click="showContentWarning = !showContentWarning"
            >
              <PhWarning :size="16" />
              <span>CW</span>
            </button>

            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm bg-gray-100 text-gray-600 transition-colors dark:bg-gray-800 dark:text-gray-400"
              @click="handleCamera"
            >
              <PhCamera :size="16" />
              <span>Photo</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.compose-enter-active,
.compose-leave-active {
  transition: transform 0.25s ease;
}

.compose-enter-from,
.compose-leave-to {
  transform: translateY(100%);
}
</style>
