<script setup lang="ts">
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle } from '@repo/ui';
import { useAuthGate } from '~/composables/useAuthGate';

const { isPromptOpen, promptLabel, closePrompt } = useAuthGate();

function handleSignIn() {
  closePrompt();
  const currentPath = window.location.pathname;
  navigateTo(`/login?redirect=${encodeURIComponent(currentPath)}`);
}

function handleOpenChange(open: boolean) {
  if (!open)
    closePrompt();
}
</script>

<template>
  <Dialog :open="isPromptOpen" @update:open="handleOpenChange">
    <DialogContent size="sm" :show-close="false">
      <div class="px-6 py-8 text-center">
        <img
          src="/images/app-icon.svg"
          alt=""
          aria-hidden="true"
          class="mx-auto h-12 w-12"
        >

        <DialogTitle class="mt-4 text-lg font-bold">
          Sign in to {{ promptLabel }}
        </DialogTitle>

        <DialogDescription class="mt-2 text-sm text-muted-foreground">
          Join Fediway to interact with posts and people across the fediverse.
        </DialogDescription>

        <div class="mt-6 space-y-3">
          <Button class="w-full" @click="handleSignIn">
            Sign in
          </Button>
          <Button variant="muted" class="w-full" @click="closePrompt">
            Not now
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
