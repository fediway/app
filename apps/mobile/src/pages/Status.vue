<script setup lang="ts">
import type { Tag } from '@repo/types';
import { PhWarningCircle } from '@phosphor-icons/vue';
import { useStatus, useStatusActions } from '@repo/api';
import { EmptyState, Skeleton, StatusAncestor, StatusDetailMain, StatusReply } from '@repo/ui';
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHaptics } from '../composables/useHaptics';
import { usePostComposer } from '../composables/usePostComposer';
import { getProfileUrl } from '../composables/useStatusBridge';

const route = useRoute();
const router = useRouter();
const { impact, notification } = useHaptics();
const { open: openComposer } = usePostComposer();

const statusData = useStatus();
const actions = useStatusActions({
  onError: () => notification('error'),
});

const statusId = computed(() => route.params.id as string);

async function load() {
  await statusData.fetch(statusId.value);
}

onMounted(load);
watch(statusId, load);

function navigateToStatus(id: string) {
  router.push(`/status/${id}`);
}

function navigateToProfile(acct: string) {
  router.push(getProfileUrl(acct));
}

async function handleFavourite(id: string) {
  impact('light');
  await actions.toggleFavourite(id);
  load();
}

async function handleReblog(id: string) {
  impact('medium');
  await actions.toggleReblog(id);
  load();
}

async function handleBookmark(id: string) {
  impact('light');
  await actions.toggleBookmark(id);
  load();
}

function handleTagClick(tag: Tag) {
  router.push(`/tags/${tag.name}`);
}
</script>

<template>
  <div class="w-full">
    <!-- Loading -->
    <div v-if="statusData.isLoading.value && !statusData.status.value" class="space-y-4 p-4">
      <Skeleton class="h-12 w-full rounded-lg" />
      <Skeleton class="h-32 w-full rounded-lg" />
      <Skeleton class="h-8 w-full rounded-lg" />
    </div>

    <!-- Error -->
    <EmptyState
      v-else-if="statusData.error.value && !statusData.status.value"
      :icon="PhWarningCircle"
      title="Couldn't load this post"
      action-label="Try again"
      @action="load"
    />

    <!-- Not found -->
    <EmptyState
      v-else-if="!statusData.status.value"
      title="Post not found"
      action-label="Go to Home"
      @action="router.push('/')"
    />

    <template v-else>
      <!-- Ancestors -->
      <StatusAncestor
        v-for="(ancestor, i) in statusData.context.value?.ancestors"
        :key="ancestor.id"
        :status="ancestor"
        :show-connector="i < (statusData.context.value?.ancestors?.length ?? 0) - 1 || !!statusData.status.value"
        @click="navigateToStatus(ancestor.id)"
        @profile-click="navigateToProfile"
      />

      <!-- Main Status -->
      <StatusDetailMain
        :status="statusData.status.value"
        @reply="openComposer(statusData.status.value)"
        @reblog="handleReblog(statusData.status.value!.id)"
        @favourite="handleFavourite(statusData.status.value!.id)"
        @bookmark="handleBookmark(statusData.status.value!.id)"
        @tag-click="handleTagClick"
        @profile-click="navigateToProfile"
        @media-click="() => {}"
      />

      <!-- Descendants -->
      <StatusReply
        v-for="reply in statusData.context.value?.descendants"
        :key="reply.id"
        :status="reply"
        @click="navigateToStatus(reply.id)"
        @reply="openComposer(reply)"
        @reblog="handleReblog(reply.id)"
        @favourite="handleFavourite(reply.id)"
        @profile-click="navigateToProfile"
      />
    </template>
  </div>
</template>
