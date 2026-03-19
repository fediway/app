<script setup lang="ts">
import type { Status } from '@repo/types';
import { PhX } from '@phosphor-icons/vue';
import {
  Button,
  CharacterCounter,
  ComposeToolbar,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  Input,
  PollEditor,
  ReplyContext,
  Textarea,
  VisibilitySelector,
} from '@repo/ui';
import { computed, ref, watch } from 'vue';
import { useSettings } from '~/composables/useSettings';

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
  post: [data: { content: string; spoilerText: string; visibility: string; poll?: PollData }];
}>();

const { settings: appSettings } = useSettings();

// Post content
const content = ref('');
const spoilerText = ref('');
const showContentWarning = ref(false);
const visibility = ref<'public' | 'unlisted' | 'private' | 'direct'>('public');
const isSubmitting = ref(false);

// Poll state
const showPoll = ref(false);
const pollOptions = ref(['', '']);
const pollMultiple = ref(false);
const pollDuration = ref(86400);

// Discard confirmation
const showDiscardConfirm = ref(false);

const CHARACTER_LIMIT = 500;

const canPost = computed(() => {
  const hasContent = content.value.trim().length > 0;
  const underLimit = content.value.length <= CHARACTER_LIMIT;
  const pollValid = !showPoll.value || pollOptions.value.filter(o => o.trim()).length >= 2;
  return hasContent && underLimit && !isSubmitting.value && pollValid;
});

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    content.value = props.replyTo ? `@${props.replyTo.account.acct} ` : '';
    spoilerText.value = '';
    showContentWarning.value = false;
    visibility.value = appSettings.privacy.defaultVisibility;
    isSubmitting.value = false;
    showPoll.value = false;
    pollOptions.value = ['', ''];
    pollMultiple.value = false;
    pollDuration.value = 86400;
    showDiscardConfirm.value = false;
  }
});

function handlePost() {
  if (!canPost.value)
    return;

  isSubmitting.value = true;

  const postData: { content: string; spoilerText: string; visibility: string; poll?: PollData } = {
    content: content.value,
    spoilerText: showContentWarning.value ? spoilerText.value : '',
    visibility: visibility.value,
  };

  const validOptions = pollOptions.value.filter(o => o.trim());
  if (showPoll.value && validOptions.length >= 2) {
    postData.poll = {
      options: validOptions,
      expiresIn: pollDuration.value,
      multiple: pollMultiple.value,
    };
  }

  emit('post', postData);
  isSubmitting.value = false;
  emit('close');
}

function handleClose() {
  if (content.value.trim()) {
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
  showDiscardConfirm.value = false;
  emit('close');
}
</script>

<template>
  <!-- Compose Dialog -->
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent size="lg" :show-close="false">
      <!-- Header -->
      <header class="flex items-center justify-between border-b border-border px-4 py-3">
        <Button variant="muted" size="sm" @click="handleClose">
          Cancel
        </Button>
        <Button size="sm" :disabled="!canPost" @click="handlePost">
          {{ isSubmitting ? 'Posting...' : 'Post' }}
        </Button>
      </header>

      <!-- Reply context -->
      <ReplyContext v-if="replyTo" :acct="replyTo.account.acct" class="px-4 pt-3" />

      <!-- Content warning input -->
      <div v-if="showContentWarning" class="px-4 pt-3">
        <Input v-model="spoilerText" placeholder="Write your warning here" />
      </div>

      <!-- Compose area -->
      <div class="p-4">
        <Textarea
          v-model="content"
          :placeholder="showContentWarning ? 'Write the content behind the warning...' : 'What\'s on your mind?'"
          class="min-h-[150px] w-full resize-none border-none bg-transparent p-0 text-[17px] leading-relaxed outline-hidden placeholder-gray-400"
          autofocus
        />
      </div>

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
              class="text-foreground/40 transition-colors hover:text-foreground/80"
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
          <label class="mb-2 block text-xs font-medium text-foreground/60">Visibility</label>
          <VisibilitySelector v-model="visibility" />
        </div>

        <div class="flex items-center justify-between">
          <ComposeToolbar
            :show-content-warning="showContentWarning"
            :show-poll="showPoll"
            @update:show-content-warning="showContentWarning = $event"
            @toggle-poll="showPoll = !showPoll"
            @add-media="() => {}"
          />
          <CharacterCounter :current="content.length" :limit="CHARACTER_LIMIT" />
        </div>
      </div>
    </DialogContent>
  </Dialog>

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
