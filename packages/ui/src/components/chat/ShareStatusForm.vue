<script setup lang="ts">
import type { Account, Status } from '@repo/types';
import { PhX } from '@phosphor-icons/vue';
import { computed, ref, watch } from 'vue';
import Avatar from '../ui/avatar/Avatar.vue';
import Button from '../ui/button/Button.vue';
import RelativeTime from '../ui/relative-time/RelativeTime.vue';

const props = defineProps<{
  status: Status;
  accounts: Account[];
  searchResults?: Account[];
}>();

const emit = defineEmits<{
  send: [data: { recipients: Account[]; message: string }];
  cancel: [];
  search: [query: string];
}>();

const HTML_TAG_RE = /<[^>]*>/g;

const searchQuery = ref('');
const selectedRecipients = ref<Account[]>([]);
const message = ref('');
const showMessage = ref(false);
const isSubmitting = ref(false);

const isSearching = computed(() => searchQuery.value.trim().length > 0);

const filteredAccounts = computed(() => {
  const selected = new Set(selectedRecipients.value.map(r => r.id));
  const source = isSearching.value && props.searchResults
    ? props.searchResults
    : props.accounts;
  return source.filter(a => !selected.has(a.id)).slice(0, 8);
});

let searchTimeout: ReturnType<typeof setTimeout> | undefined;
watch(searchQuery, (query) => {
  clearTimeout(searchTimeout);
  const trimmed = query.trim();
  if (trimmed) {
    searchTimeout = setTimeout(() => emit('search', trimmed), 250);
  }
});

const canSend = computed(() =>
  selectedRecipients.value.length > 0 && !isSubmitting.value,
);

function toggleRecipient(account: Account) {
  const idx = selectedRecipients.value.findIndex(r => r.id === account.id);
  if (idx >= 0) {
    selectedRecipients.value.splice(idx, 1);
  }
  else {
    selectedRecipients.value.push(account);
  }
  searchQuery.value = '';
}

function isSelected(accountId: string): boolean {
  return selectedRecipients.value.some(r => r.id === accountId);
}

function handleSend() {
  if (!canSend.value)
    return;
  isSubmitting.value = true;
  emit('send', {
    recipients: selectedRecipients.value,
    message: message.value,
  });
}

function stripHtml(html: string): string {
  return html.replace(HTML_TAG_RE, '').trim();
}

function reset() {
  searchQuery.value = '';
  selectedRecipients.value = [];
  message.value = '';
  showMessage.value = false;
  isSubmitting.value = false;
}

watch(() => props.status.id, reset);

defineExpose({ reset });
</script>

<template>
  <div data-slot="share-status-form">
    <!-- Compact status preview -->
    <div class="flex items-center gap-2.5 border-b border-border px-4 py-3">
      <Avatar :src="status.account.avatar" :alt="status.account.displayName" size="sm" />
      <div class="min-w-0 flex-1">
        <span class="text-sm font-semibold text-foreground">{{ status.account.displayName }}</span>
        <span class="ml-1 text-sm text-muted-foreground">·</span>
        <RelativeTime :datetime="status.createdAt" class="ml-1 text-sm text-muted-foreground-subtle" />
        <p class="truncate text-sm text-muted-foreground">
          {{ stripHtml(status.content) }}
        </p>
      </div>
      <Button variant="muted" size="icon" class="size-7 shrink-0" @click="emit('cancel')">
        <PhX :size="18" />
      </Button>
    </div>

    <!-- Selected recipients -->
    <div v-if="selectedRecipients.length > 0" class="flex items-center gap-1 border-b border-border px-4 py-2">
      <button
        v-for="recipient in selectedRecipients"
        :key="recipient.id"
        type="button"
        class="group relative shrink-0"
        @click="toggleRecipient(recipient)"
      >
        <Avatar :src="recipient.avatar" :alt="recipient.displayName" size="sm" />
        <div class="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <PhX :size="14" class="text-white" />
        </div>
      </button>
      <span class="ml-1 text-xs text-muted-foreground-subtle">{{ selectedRecipients.length }} selected</span>
    </div>

    <!-- Search -->
    <div class="border-b border-border px-4 py-2">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="selectedRecipients.length > 0 ? 'Add more people...' : 'Search people...'"
        class="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
      >
    </div>

    <!-- Recipients / contacts -->
    <div class="max-h-[320px] overflow-y-auto">
      <button
        v-for="account in filteredAccounts"
        :key="account.id"
        type="button"
        class="flex w-full items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50"
        @click="toggleRecipient(account)"
      >
        <div class="relative">
          <Avatar :src="account.avatar" :alt="account.displayName" size="md" />
          <!-- Checkmark overlay -->
          <div
            v-if="isSelected(account.id)"
            class="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-foreground"
          >
            <svg class="size-3 text-background" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M2 6l3 3 5-5" />
            </svg>
          </div>
        </div>
        <div class="min-w-0 flex-1 text-left">
          <div class="truncate text-sm font-semibold text-foreground">
            {{ account.displayName }}
          </div>
          <div class="truncate text-xs text-muted-foreground">
            @{{ account.acct }}
          </div>
        </div>
      </button>
    </div>

    <!-- Optional message + send -->
    <div class="border-t border-border px-4 py-3">
      <div v-if="showMessage" class="mb-3">
        <textarea
          v-model="message"
          placeholder="Add a message..."
          rows="2"
          class="w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-ring"
        />
      </div>
      <div class="flex items-center justify-between">
        <button
          v-if="!showMessage"
          type="button"
          class="text-sm text-muted-foreground transition-colors hover:text-foreground"
          @click="showMessage = true"
        >
          Add message
        </button>
        <span v-else />
        <Button
          size="sm"
          :disabled="!canSend"
          @click="handleSend"
        >
          {{ isSubmitting ? 'Sending...' : `Send${selectedRecipients.length > 0 ? ` (${selectedRecipients.length})` : ''}` }}
        </Button>
      </div>
    </div>
  </div>
</template>
