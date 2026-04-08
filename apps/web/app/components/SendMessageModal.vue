<script setup lang="ts">
import type { Account, Status } from '@repo/types';
import { useAuth, useClient } from '@repo/api';
import { Dialog, DialogContent, DialogDescription, DialogTitle, ShareStatusForm } from '@repo/ui';
import { VisuallyHidden } from 'reka-ui';
import { ref, watch } from 'vue';

interface Props {
  isOpen: boolean;
  status: Status | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  send: [data: { recipients: Account[]; message: string; status: Status }];
}>();

const { currentUser } = useAuth();
const client = useClient();
const { getAccountFollowing } = useAccountData();

const followingAcct = computed(() => currentUser.value?.acct ?? '');
const { data: following } = getAccountFollowing(followingAcct.value);

const searchResults = ref<Account[]>([]);

async function handleSearch(query: string) {
  if (!query.trim()) {
    searchResults.value = [];
    return;
  }
  const result = await client.rest.v2.search.list({ q: query, type: 'accounts', limit: 20 });
  searchResults.value = result.accounts;
}

const formRef = ref<InstanceType<typeof ShareStatusForm>>();

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    formRef.value?.reset();
    searchResults.value = [];
  }
});

function handleSend(data: { recipients: Account[]; message: string }) {
  if (!props.status)
    return;
  emit('send', { ...data, status: props.status });
  emit('close');
}

function handleOpenChange(open: boolean) {
  if (!open)
    emit('close');
}
</script>

<template>
  <Dialog :open="isOpen && !!status" @update:open="handleOpenChange">
    <DialogContent size="md" :show-close="false">
      <VisuallyHidden>
        <DialogTitle>Send message</DialogTitle>
        <DialogDescription>Share this post with someone</DialogDescription>
      </VisuallyHidden>

      <ShareStatusForm
        v-if="status"
        ref="formRef"
        :status="status"
        :accounts="following"
        :search-results="searchResults"
        @send="handleSend"
        @cancel="emit('close')"
        @search="handleSearch"
      />
    </DialogContent>
  </Dialog>
</template>
