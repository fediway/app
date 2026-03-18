<script setup lang="ts">
import type { Status } from '@repo/types';
import { PhChartBar, PhChatCircle, PhClock, PhEnvelope, PhGlobe, PhImage, PhLock, PhLockOpen, PhPlus, PhWarning, PhX } from '@phosphor-icons/vue';
import { Button, Input } from '@repo/ui';
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
const pollDuration = ref(86400); // Default: 1 day in seconds

// Poll duration options (in seconds)
const pollDurationOptions = [
  { value: 300, label: '5 minutes' },
  { value: 1800, label: '30 minutes' },
  { value: 3600, label: '1 hour' },
  { value: 21600, label: '6 hours' },
  { value: 86400, label: '1 day' },
  { value: 259200, label: '3 days' },
  { value: 604800, label: '7 days' },
] as const;

const MIN_POLL_OPTIONS = 2;
const MAX_POLL_OPTIONS = 4;

// Character limit (Mastodon default)
const CHARACTER_LIMIT = 500;

const characterCount = computed(() => content.value.length);
const charactersRemaining = computed(() => CHARACTER_LIMIT - characterCount.value);
const isOverLimit = computed(() => charactersRemaining.value < 0);

// Poll validation
const validPollOptions = computed(() => pollOptions.value.filter(opt => opt.trim().length > 0));
const isPollValid = computed(() => {
  if (!showPoll.value)
    return true;
  return validPollOptions.value.length >= MIN_POLL_OPTIONS;
});

const canPost = computed(() => {
  return content.value.trim().length > 0 && !isOverLimit.value && !isSubmitting.value && isPollValid.value;
});

// Poll functions
function addPollOption() {
  if (pollOptions.value.length < MAX_POLL_OPTIONS) {
    pollOptions.value.push('');
  }
}

function removePollOption(index: number) {
  if (pollOptions.value.length > MIN_POLL_OPTIONS) {
    pollOptions.value.splice(index, 1);
  }
}

function togglePoll() {
  showPoll.value = !showPoll.value;
  if (showPoll.value && pollOptions.value.length < MIN_POLL_OPTIONS) {
    pollOptions.value = ['', ''];
  }
}

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    // Pre-fill @mention when replying
    if (props.replyTo) {
      content.value = `@${props.replyTo.account.acct} `;
    }
    else {
      content.value = '';
    }
    spoilerText.value = '';
    showContentWarning.value = false;
    visibility.value = appSettings.privacy.defaultVisibility;
    isSubmitting.value = false;
    // Reset poll state
    showPoll.value = false;
    pollOptions.value = ['', ''];
    pollMultiple.value = false;
    pollDuration.value = 86400;
  }
});

// Visibility options
const visibilityOptions = [
  { value: 'public', label: 'Public', description: 'Visible to everyone' },
  { value: 'unlisted', label: 'Unlisted', description: 'Visible but not in public timelines' },
  { value: 'private', label: 'Followers', description: 'Only visible to followers' },
  { value: 'direct', label: 'Direct', description: 'Only visible to mentioned users' },
] as const;

function getVisibilityIcon(value: string): string {
  switch (value) {
    case 'public': return 'globe';
    case 'unlisted': return 'unlock';
    case 'private': return 'lock';
    case 'direct': return 'mail';
    default: return 'globe';
  }
}

function handlePost() {
  if (!canPost.value)
    return;

  isSubmitting.value = true;

  // Build post data
  const postData: { content: string; spoilerText: string; visibility: string; poll?: PollData } = {
    content: content.value,
    spoilerText: showContentWarning.value ? spoilerText.value : '',
    visibility: visibility.value,
  };

  // Include poll data if poll is enabled
  if (showPoll.value && validPollOptions.value.length >= MIN_POLL_OPTIONS) {
    postData.poll = {
      options: validPollOptions.value,
      expiresIn: pollDuration.value,
      multiple: pollMultiple.value,
    };
  }

  emit('post', postData);

  // Simulate posting delay then close
  setTimeout(() => {
    isSubmitting.value = false;
    emit('close');
  }, 500);
}

function handleClose() {
  // eslint-disable-next-line no-alert
  if (content.value.trim() && !confirm('Discard this post?')) {
    return;
  }
  emit('close');
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleClose();
  }
}

// Close on escape key
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleClose();
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
        @click="handleBackdropClick"
        @keydown="handleKeydown"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" />

        <!-- Modal -->
        <div class="relative w-full max-w-[650px] bg-white rounded-2xl shadow-xl overflow-hidden">
          <!-- Header -->
          <header class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <Button
              variant="muted"
              size="sm"
              class="text-gray-600 hover:text-gray-900"
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
          <div v-if="replyTo" class="px-4 pt-3 pb-0">
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <PhChatCircle :size="16" />
              <span>Replying to <strong class="text-gray-700">@{{ replyTo.account.acct }}</strong></span>
            </div>
          </div>

          <!-- Composer -->
          <div class="p-4">
            <!-- Content Warning Input -->
            <div v-if="showContentWarning" class="mb-3">
              <Input
                v-model="spoilerText"
                type="text"
                placeholder="Write your warning here"
                class="text-sm rounded-lg"
              />
            </div>

            <!-- Main Textarea -->
            <div class="relative">
              <textarea
                v-model="content"
                :placeholder="showContentWarning ? 'Write the content behind the warning...' : 'What\'s on your mind?'"
                class="w-full min-h-[150px] p-0 text-[17px] leading-relaxed resize-none border-none outline-hidden placeholder-gray-400"
                autofocus
              />
            </div>

            <!-- Character Count -->
            <div class="flex justify-end mt-2">
              <span
                class="text-sm" :class="[
                  isOverLimit ? 'text-red-500 font-medium' : charactersRemaining <= 50 ? 'text-orange-500' : 'text-gray-400',
                ]"
              >
                {{ charactersRemaining }}
              </span>
            </div>

            <!-- Poll Editor -->
            <div v-if="showPoll" class="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-gray-700">Poll</span>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Remove poll"
                  @click="showPoll = false"
                >
                  <PhX :size="20" />
                </button>
              </div>

              <!-- Poll Options -->
              <div class="space-y-2 mb-4">
                <div
                  v-for="(option, index) in pollOptions"
                  :key="index"
                  class="flex items-center gap-2"
                >
                  <div class="shrink-0 w-5 h-5 flex items-center justify-center">
                    <div
                      class="border-2 border-gray-300" :class="[
                        pollMultiple ? 'w-4 h-4 rounded' : 'w-4 h-4 rounded-full',
                      ]"
                    />
                  </div>
                  <Input
                    v-model="pollOptions[index]"
                    type="text"
                    :placeholder="`Option ${index + 1}`"
                    maxlength="50"
                    class="flex-1 text-sm rounded-lg"
                  />
                  <button
                    v-if="pollOptions.length > MIN_POLL_OPTIONS"
                    type="button"
                    class="shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove option"
                    @click="removePollOption(index)"
                  >
                    <PhX :size="16" />
                  </button>
                  <div v-else class="w-6" />
                </div>
              </div>

              <!-- Add Option Button -->
              <button
                v-if="pollOptions.length < MAX_POLL_OPTIONS"
                type="button"
                class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors mb-4"
                @click="addPollOption"
              >
                <PhPlus :size="16" />
                <span>Add option</span>
              </button>

              <!-- Poll Settings -->
              <div class="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-200">
                <!-- Duration Selector -->
                <div class="flex items-center gap-2">
                  <PhClock :size="16" class="text-gray-500" />
                  <select
                    v-model="pollDuration"
                    class="text-sm bg-white border border-gray-200 rounded-lg px-2 py-1.5 outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option
                      v-for="option in pollDurationOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </div>

                <!-- Multiple Choice Toggle -->
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="pollMultiple"
                    type="checkbox"
                    class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                  <span class="text-sm text-gray-600">Multiple choices</span>
                </label>
              </div>

              <!-- Validation Warning -->
              <div
                v-if="validPollOptions.length < MIN_POLL_OPTIONS"
                class="mt-3 text-xs text-orange-600"
              >
                Add at least {{ MIN_POLL_OPTIONS }} options to create a poll
              </div>
            </div>
          </div>

          <!-- Bottom Toolbar -->
          <div class="border-t border-gray-200 px-4 py-3">
            <!-- Visibility Selector -->
            <div class="mb-4">
              <label class="block text-xs font-medium text-gray-500 mb-2">Visibility</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="option in visibilityOptions"
                  :key="option.value"
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors" :class="[
                    visibility === option.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  ]"
                  :title="option.description"
                  @click="visibility = option.value"
                >
                  <!-- Visibility Icons -->
                  <PhGlobe v-if="getVisibilityIcon(option.value) === 'globe'" :size="16" />
                  <PhLockOpen v-else-if="getVisibilityIcon(option.value) === 'unlock'" :size="16" />
                  <PhLock v-else-if="getVisibilityIcon(option.value) === 'lock'" :size="16" />
                  <PhEnvelope v-else-if="getVisibilityIcon(option.value) === 'mail'" :size="16" />
                  <span>{{ option.label }}</span>
                </button>
              </div>
            </div>

            <!-- Options Row -->
            <div class="flex items-center gap-4">
              <!-- Content Warning Toggle -->
              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors" :class="[
                  showContentWarning
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                ]"
                @click="showContentWarning = !showContentWarning"
              >
                <PhWarning :size="16" />
                <span>CW</span>
              </button>

              <!-- Poll Toggle -->
              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors" :class="[
                  showPoll
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                ]"
                @click="togglePoll"
              >
                <PhChartBar :size="16" />
                <span>Poll</span>
              </button>

              <!-- Media Button (placeholder for future) -->
              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                title="Attach media (coming soon)"
              >
                <PhImage :size="16" />
                <span>Media</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95) translateY(-10px);
}
</style>
