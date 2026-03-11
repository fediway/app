<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import { RelativeTime, RichText, StatusActions, StatusMedia, StatusTags } from '@repo/ui';
import { computed } from 'vue';
import { useData } from '~/composables/useData';
import { useInteractions } from '~/composables/useInteractions';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { usePostComposer } from '~/composables/usePostComposer';

const route = useRoute();
const router = useRouter();

const { getStatusById, getStatusContext, getProfileUrl } = useData();
const { toggleFavourite, toggleReblog, toggleBookmark, withOverrides } = useInteractions();
const { open: openLightbox } = useMediaLightbox();
const { open: openComposer } = usePostComposer();

const statusId = computed(() => route.params.id as string);

const rawStatus = computed(() => getStatusById(statusId.value));
const status = computed(() => rawStatus.value ? withOverrides(rawStatus.value) : undefined);
const context = computed(() => getStatusContext(statusId.value));

// Navigation
function goBack() {
  if (window.history.length > 1) {
    router.back();
  }
  else {
    router.push('/');
  }
}

function navigateToStatus(id: string) {
  router.push(`/status/${id}`);
}

// Event handlers
function handleReblog(id: string) {
  if (rawStatus.value)
    toggleReblog(id, [rawStatus.value]);
}

function handleFavourite(id: string) {
  if (rawStatus.value)
    toggleFavourite(id, [rawStatus.value]);
}

function handleBookmark(id: string) {
  if (rawStatus.value)
    toggleBookmark(id, [rawStatus.value]);
}

function handleShare(id: string) {
  if (navigator.share) {
    navigator.share({ url: `${window.location.origin}/status/${id}` });
  }
}

function handleTagClick(tag: Tag) {
  router.push(`/tags/${tag.name}`);
}

function handleReply(replyToStatus?: Status) {
  const target = replyToStatus ?? status.value;
  if (target)
    openComposer(target);
}

function handleMediaClick(_attachment: MediaAttachment, index: number) {
  if (status.value) {
    openLightbox(status.value.mediaAttachments, index);
  }
}

// Format full timestamp for main status
function formatFullTimestamp(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
</script>

<template>
  <div class="w-full">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          @click="goBack"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-lg font-semibold">
          Post
        </h1>
      </div>
    </header>

    <!-- Not found state -->
    <div v-if="!status" class="p-8 text-center text-gray-500">
      <p>Post not found</p>
      <button
        type="button"
        class="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        @click="router.push('/')"
      >
        Go to Home
      </button>
    </div>

    <template v-else>
      <!-- Ancestors (parent chain) -->
      <div v-if="context.ancestors.length > 0" class="ancestor-section">
        <div
          v-for="(ancestor, index) in context.ancestors"
          :key="ancestor.id"
          class="relative cursor-pointer hover:bg-gray-50 transition-colors"
          @click="navigateToStatus(ancestor.id)"
        >
          <!-- Vertical connector line -->
          <div
            v-if="index < context.ancestors.length - 1 || status"
            class="absolute left-8 top-14 bottom-0 w-0.5 bg-gray-300"
          />

          <article class="px-4 py-3">
            <div class="flex gap-3">
              <NuxtLink :to="getProfileUrl(ancestor.account.acct)" class="shrink-0" @click.stop>
                <img
                  :src="ancestor.account.avatar"
                  :alt="ancestor.account.displayName"
                  class="w-10 h-10 rounded-full"
                >
              </NuxtLink>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1 text-sm">
                  <NuxtLink :to="getProfileUrl(ancestor.account.acct)" class="font-semibold truncate no-underline text-gray-900 hover:underline" @click.stop>
                    {{ ancestor.account.displayName }}
                  </NuxtLink>
                  <span class="text-gray-500 truncate">@{{ ancestor.account.acct }}</span>
                  <span class="text-gray-400">·</span>
                  <RelativeTime :datetime="ancestor.createdAt" class="text-gray-500 text-sm" />
                </div>
                <RichText :content="ancestor.content" :emojis="ancestor.emojis" class="mt-1 text-gray-900" />
              </div>
            </div>
          </article>
        </div>

        <!-- Connector to main status -->
        <div class="relative h-4">
          <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300" />
        </div>
      </div>

      <!-- Main (focused) status -->
      <article class="main-status border-b border-gray-200 bg-gray-50/50">
        <!-- Author info -->
        <div class="px-4 pt-4 mb-4">
          <NuxtLink :to="getProfileUrl(status.account.acct)" class="flex items-center gap-3 no-underline">
            <img
              :src="status.account.avatar"
              :alt="status.account.displayName"
              class="w-12 h-12 rounded-full"
            >
            <div>
              <div class="font-semibold text-gray-900 hover:underline">
                {{ status.account.displayName }}
              </div>
              <div class="text-gray-500 text-sm">
                @{{ status.account.acct }}
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Media (full width) -->
        <StatusMedia
          v-if="status.mediaAttachments.length > 0"
          :attachments="status.mediaAttachments"
          :sensitive="status.sensitive"
          class="mb-4"
          @media-click="handleMediaClick"
        />

        <div class="px-4">
          <!-- Content (larger) -->
          <RichText :content="status.content" :emojis="status.emojis" class="text-lg leading-relaxed mb-4" />

          <!-- Tags -->
          <div v-if="status.tags.length > 0" class="mb-4">
            <StatusTags :tags="status.tags" @tag-click="handleTagClick" />
          </div>

          <!-- Full timestamp -->
          <div class="text-gray-500 text-sm py-3 border-t border-gray-200">
            {{ formatFullTimestamp(status.createdAt) }}
          </div>

          <!-- Stats bar -->
          <div class="flex gap-6 py-3 border-t border-gray-200 text-sm">
            <div v-if="status.reblogsCount > 0">
              <span class="font-semibold">{{ status.reblogsCount }}</span>
              <span class="text-gray-500 ml-1">Reblogs</span>
            </div>
            <div v-if="status.favouritesCount > 0">
              <span class="font-semibold">{{ status.favouritesCount }}</span>
              <span class="text-gray-500 ml-1">Likes</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="py-2 border-t border-gray-200">
            <StatusActions
              :replies-count="status.repliesCount"
              :reblogs-count="status.reblogsCount"
              :favourites-count="status.favouritesCount"
              :favourited="status.favourited ?? false"
              :reblogged="status.reblogged ?? false"
              :bookmarked="status.bookmarked ?? false"
              :visibility="status.visibility"
              @reblog="handleReblog(status.id)"
              @favourite="handleFavourite(status.id)"
              @bookmark="handleBookmark(status.id)"
              @share="handleShare(status.id)"
            />
          </div>
        </div>
      </article>

      <!-- Descendants (replies) - flat list like Twitter/Bluesky -->
      <div v-if="context.descendants.length > 0" class="replies-section">
        <div
          v-for="reply in context.descendants"
          :key="reply.id"
          class="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
          @click="navigateToStatus(reply.id)"
        >
          <article class="px-4 py-3">
            <div class="flex gap-3">
              <NuxtLink :to="getProfileUrl(reply.account.acct)" class="shrink-0" @click.stop>
                <img
                  :src="reply.account.avatar"
                  :alt="reply.account.displayName"
                  class="w-10 h-10 rounded-full"
                >
              </NuxtLink>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1 text-sm flex-wrap">
                  <NuxtLink :to="getProfileUrl(reply.account.acct)" class="font-semibold truncate no-underline text-gray-900 hover:underline" @click.stop>
                    {{ reply.account.displayName }}
                  </NuxtLink>
                  <span class="text-gray-500 truncate">@{{ reply.account.acct }}</span>
                  <span class="text-gray-400">·</span>
                  <RelativeTime :datetime="reply.createdAt" class="text-gray-500" />
                </div>
                <RichText :content="reply.content" :emojis="reply.emojis" class="mt-1 text-gray-900" />

                <!-- Reply actions (compact) -->
                <div class="flex gap-4 mt-2 text-gray-500 text-sm">
                  <button
                    type="button"
                    class="flex items-center gap-1 hover:text-blue-500"
                    @click.stop="handleReply(reply)"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    <span v-if="reply.repliesCount > 0">{{ reply.repliesCount }}</span>
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-1 hover:text-green-500"
                    @click.stop="handleReblog(reply.id)"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="17 1 21 5 17 9" />
                      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                      <polyline points="7 23 3 19 7 15" />
                      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                    <span v-if="reply.reblogsCount > 0">{{ reply.reblogsCount }}</span>
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-1 hover:text-red-500"
                    @click.stop="handleFavourite(reply.id)"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span v-if="reply.favouritesCount > 0">{{ reply.favouritesCount }}</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ancestor-section :deep(p) {
  margin: 0;
}

.main-status :deep(p) {
  margin: 0;
}

.replies-section :deep(p) {
  margin: 0;
}
</style>
