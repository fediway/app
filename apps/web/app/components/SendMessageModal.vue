<script setup lang="ts">
import type { Account, Status } from '@repo/types';
import { Dialog, DialogContent, ShareStatusForm } from '@repo/ui';
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

const { getAllAccounts } = useAccountData();
const { data: allAccounts } = getAllAccounts();
const formRef = ref<InstanceType<typeof ShareStatusForm>>();

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    formRef.value?.reset();
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
      <ShareStatusForm
        v-if="status"
        ref="formRef"
        :status="status"
        :accounts="allAccounts"
        @send="handleSend"
        @cancel="emit('close')"
      />
    </DialogContent>
  </Dialog>
</template>
