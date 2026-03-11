<script setup lang="ts">
import type { Account, Status } from '@repo/types';
import { computed, ref, watch } from 'vue';
import { useData } from '~/composables/useData';

interface Props {
  isOpen: boolean;
  status: Status | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  send: [data: { recipients: Account[]; message: string; status: Status }];
}>();

const { getAllAccounts } = useData();

const searchQuery = ref('');
const selectedRecipients = ref<Account[]>([]);
const message = ref('');
const isSubmitting = ref(false);

// Filter accounts based on search
const filteredAccounts = computed(() => {
  const accounts = getAllAccounts();
  if (!searchQuery.value.trim()) {
    return accounts.filter(a => !selectedRecipients.value.find(r => r.id === a.id));
  }
  const query = searchQuery.value.toLowerCase();
  return accounts.filter(a =>
    !selectedRecipients.value.find(r => r.id === a.id)
    && (a.displayName.toLowerCase().includes(query)
      || a.acct.toLowerCase().includes(query)
      || a.username.toLowerCase().includes(query)),
  );
});

const canSend = computed(() => {
  return selectedRecipients.value.length > 0 && !isSubmitting.value;
});

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    searchQuery.value = '';
    selectedRecipients.value = [];
    message.value = '';
    isSubmitting.value = false;
  }
});

function addRecipient(account: Account) {
  if (!selectedRecipients.value.find(r => r.id === account.id)) {
    selectedRecipients.value.push(account);
  }
  searchQuery.value = '';
}

function removeRecipient(accountId: string) {
  selectedRecipients.value = selectedRecipients.value.filter(r => r.id !== accountId);
}

function handleSend() {
  if (!canSend.value || !props.status)
    return;

  isSubmitting.value = true;

  emit('send', {
    recipients: selectedRecipients.value,
    message: message.value,
    status: props.status,
  });

  setTimeout(() => {
    isSubmitting.value = false;
    emit('close');
  }, 500);
}

function handleClose() {
  emit('close');
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleClose();
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleClose();
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen && status"
        class="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
        @click="handleBackdropClick"
        @keydown="handleKeydown"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" />

        <!-- Modal -->
        <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
          <!-- Header -->
          <header class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">
              Send as message
            </h2>
            <button
              type="button"
              class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              @click="handleClose"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </header>

          <div class="p-4">
            <!-- Recipients Section -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">To</label>

              <!-- Selected Recipients -->
              <div v-if="selectedRecipients.length > 0" class="flex flex-wrap gap-2 mb-2">
                <span
                  v-for="recipient in selectedRecipients"
                  :key="recipient.id"
                  class="inline-flex items-center gap-1.5 pl-1 pr-2 py-1 bg-gray-100 rounded-full text-sm"
                >
                  <img
                    :src="recipient.avatar"
                    :alt="recipient.displayName"
                    class="w-5 h-5 rounded-full"
                  >
                  <span class="text-gray-700">{{ recipient.displayName }}</span>
                  <button
                    type="button"
                    class="ml-1 text-gray-400 hover:text-gray-600"
                    @click="removeRecipient(recipient.id)"
                  >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </span>
              </div>

              <!-- Search Input -->
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search for people..."
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-hidden focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                >

                <!-- Search Results Dropdown -->
                <div
                  v-if="searchQuery || selectedRecipients.length === 0"
                  class="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto"
                >
                  <button
                    v-for="account in filteredAccounts.slice(0, 5)"
                    :key="account.id"
                    type="button"
                    class="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                    @click="addRecipient(account)"
                  >
                    <img
                      :src="account.avatar"
                      :alt="account.displayName"
                      class="w-8 h-8 rounded-full"
                    >
                    <div class="min-w-0">
                      <div class="text-sm font-medium text-gray-900 truncate">
                        {{ account.displayName }}
                      </div>
                      <div class="text-xs text-gray-500 truncate">
                        @{{ account.acct }}
                      </div>
                    </div>
                  </button>
                  <div v-if="filteredAccounts.length === 0" class="px-3 py-4 text-sm text-gray-500 text-center">
                    No users found
                  </div>
                </div>
              </div>
            </div>

            <!-- Message Input -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Message (optional)</label>
              <textarea
                v-model="message"
                placeholder="Add a message..."
                rows="2"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-hidden focus:border-gray-400 focus:ring-2 focus:ring-gray-100 resize-none"
              />
            </div>

            <!-- Post Preview -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Sharing</label>
              <div class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div class="flex items-start gap-3">
                  <img
                    :src="status.account.avatar"
                    :alt="status.account.displayName"
                    class="w-8 h-8 rounded-full shrink-0"
                  >
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1 text-sm">
                      <span class="font-semibold text-gray-900">{{ status.account.displayName }}</span>
                      <span class="text-gray-500">@{{ status.account.acct }}</span>
                    </div>
                    <p class="text-sm text-gray-700 mt-1 line-clamp-2">
                      {{ stripHtml(status.content) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <footer class="flex items-center justify-end gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              @click="handleClose"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="!canSend"
              class="px-4 py-2 text-sm font-medium rounded-lg transition-colors" :class="[
                canSend
                  ? 'bg-gray-900 text-white hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed',
              ]"
              @click="handleSend"
            >
              <span v-if="isSubmitting">Sending...</span>
              <span v-else>Send</span>
            </button>
          </footer>
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
