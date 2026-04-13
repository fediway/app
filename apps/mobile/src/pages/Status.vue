<script setup lang="ts">
import { PhWarningCircle } from '@phosphor-icons/vue';
import { useStatus, useStatusActions } from '@repo/api';
import { DeletedStatusTombstone, EmptyState, shapeThreadContext, Status, StatusDetailMain, StatusReply, ThreadCollapseNode, ThreadSkeleton } from '@repo/ui';
import { computed, onMounted, ref, watch } from 'vue';
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

function handleTagClick(tagName: string) {
  router.push(`/tags/${encodeURIComponent(tagName)}`);
}

const expandedCollapseKeys = ref<Set<string>>(new Set());

watch(statusId, () => {
  expandedCollapseKeys.value = new Set();
});

const shapedThread = computed(() => {
  const main = statusData.status.value;
  if (!main) {
    return { ancestors: [], descendants: [] };
  }
  return shapeThreadContext({
    ancestors: statusData.context.value?.ancestors ?? [],
    main,
    descendants: statusData.context.value?.descendants ?? [],
    expandedKeys: expandedCollapseKeys.value,
  });
});

function expandCollapse(key: string) {
  expandedCollapseKeys.value = new Set([...expandedCollapseKeys.value, key]);
}
</script>

<template>
  <div class="w-full">
    <!-- Loading skeleton — thread-shaped so the page doesn't visually shift on load -->
    <ThreadSkeleton v-if="statusData.isLoading.value && !statusData.status.value" :ancestors="1" :descendants="3" />

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
      <!-- Ancestors — Status, ThreadCollapseNode, or DeletedStatusTombstone -->
      <template v-for="item in shapedThread.ancestors" :key="item.kind === 'status' ? item.status.id : item.key">
        <Status
          v-if="item.kind === 'status'"
          :status="item.status"
          :thread-position="item.position"
          :is-author-reply="item.isAuthorReply"
          :hide-actions="true"
          :show-separator="false"
          @status-click="navigateToStatus"
          @profile-click="navigateToProfile"
          @tag-click="handleTagClick"
        />
        <ThreadCollapseNode
          v-else-if="item.kind === 'collapse'"
          :accounts="item.accounts"
          :hidden-count="item.hiddenCount"
          :thread-position="item.position"
          :show-separator="false"
          @expand="expandCollapse(item.key)"
        />
        <DeletedStatusTombstone
          v-else
          :reason="item.reason"
          :thread-position="item.position"
          :show-separator="false"
        />
      </template>

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
