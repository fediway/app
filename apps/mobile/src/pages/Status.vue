<script setup lang="ts">
import type { Tag } from '@repo/types';
import { PhArrowLeft, PhChatCircle, PhHeart, PhRepeat } from '@phosphor-icons/vue';
import { AccountDisplayName, AccountHandle, Avatar, RelativeTime, RichText, StatusActions, StatusMedia, StatusTags } from '@repo/ui';
import Button from '@ui/components/ui/button/Button.vue';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useData } from '../composables/useData';
import { useInteractions } from '../composables/useInteractions';
import { usePostComposer } from '../composables/usePostComposer';

const route = useRoute();
const router = useRouter();
const { getStatusById, getStatusContext, getProfileUrl } = useData();
const { toggleFavourite, toggleReblog, toggleBookmark, withOverrides } = useInteractions();
const { open: openComposer } = usePostComposer();

const statusId = computed(() => route.params.id as string);
const rawStatus = computed(() => getStatusById(statusId.value));
const status = computed(() => rawStatus.value ? withOverrides(rawStatus.value) : undefined);
const context = computed(() => getStatusContext(statusId.value));

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

function handleTagClick(tag: Tag) {
  router.push(`/tags/${tag.name}`);
}

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
    <header class="sticky top-[calc(3.5rem+var(--safe-area-inset-top))] z-10 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
      <div class="flex items-center gap-4">
        <Button variant="muted" size="icon" class="-ml-2 size-9" @click="goBack">
          <PhArrowLeft :size="20" />
        </Button>
        <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Post
        </h1>
      </div>
    </header>

    <!-- Not found -->
    <div v-if="!status" class="p-8 text-center text-gray-500">
      <p>Post not found</p>
      <Button variant="secondary" size="sm" class="mt-4" @click="router.push('/')">
        Go to Home
      </Button>
    </div>

    <template v-else>
      <!-- Ancestors -->
      <div v-if="context.ancestors.length > 0">
        <div
          v-for="(ancestor, index) in context.ancestors"
          :key="ancestor.id"
          class="relative transition-colors active:bg-gray-50 dark:active:bg-gray-800"
          @click="navigateToStatus(ancestor.id)"
        >
          <div
            v-if="index < context.ancestors.length - 1 || status"
            class="absolute bottom-0 left-8 top-14 w-0.5 bg-gray-300 dark:bg-gray-600"
          />
          <article class="px-4 py-3">
            <div class="flex gap-3">
              <router-link :to="getProfileUrl(ancestor.account.acct)" class="shrink-0" @click.stop>
                <Avatar :src="ancestor.account.avatar" :alt="ancestor.account.displayName" size="sm" />
              </router-link>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1 text-sm">
                  <AccountDisplayName
                    :name="ancestor.account.displayName || ancestor.account.username"
                    :emojis="ancestor.account.emojis"
                    :as-link="true"
                    :href="getProfileUrl(ancestor.account.acct)"
                    class="truncate text-sm"
                    @click.stop
                  />
                  <AccountHandle :acct="ancestor.account.acct" class="truncate text-sm" />
                  <span class="text-gray-400">·</span>
                  <RelativeTime :datetime="ancestor.createdAt" class="text-sm text-gray-500" />
                </div>
                <RichText :content="ancestor.content" :emojis="ancestor.emojis" class="mt-1 text-gray-900 dark:text-gray-100" />
              </div>
            </div>
          </article>
        </div>
        <div class="relative h-4">
          <div class="absolute bottom-0 left-8 top-0 w-0.5 bg-gray-300 dark:bg-gray-600" />
        </div>
      </div>

      <!-- Main status -->
      <article class="border-b border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30">
        <div class="mb-4 px-4 pt-4">
          <router-link :to="getProfileUrl(status.account.acct)" class="flex items-center gap-3 no-underline">
            <Avatar :src="status.account.avatar" :alt="status.account.displayName" size="md" />
            <div>
              <AccountDisplayName :name="status.account.displayName || status.account.username" :emojis="status.account.emojis" />
              <AccountHandle :acct="status.account.acct" class="block text-sm" />
            </div>
          </router-link>
        </div>

        <StatusMedia
          v-if="status.mediaAttachments.length > 0"
          :attachments="status.mediaAttachments"
          :sensitive="status.sensitive"
          class="mb-4"
        />

        <div class="px-4">
          <RichText :content="status.content" :emojis="status.emojis" class="mb-4 text-lg leading-relaxed text-gray-900 dark:text-gray-100" />

          <div v-if="status.tags.length > 0" class="mb-4">
            <StatusTags :tags="status.tags" @tag-click="handleTagClick" />
          </div>

          <div class="border-t border-gray-200 py-3 text-sm text-gray-500 dark:border-gray-700">
            {{ formatFullTimestamp(status.createdAt) }}
          </div>

          <div class="flex gap-6 border-t border-gray-200 py-3 text-sm dark:border-gray-700">
            <div v-if="status.reblogsCount > 0">
              <span class="font-semibold text-gray-900 dark:text-gray-100">{{ status.reblogsCount }}</span>
              <span class="ml-1 text-gray-500">Reblogs</span>
            </div>
            <div v-if="status.favouritesCount > 0">
              <span class="font-semibold text-gray-900 dark:text-gray-100">{{ status.favouritesCount }}</span>
              <span class="ml-1 text-gray-500">Likes</span>
            </div>
          </div>

          <div class="border-t border-gray-200 py-2 dark:border-gray-700">
            <StatusActions
              :replies-count="status.repliesCount"
              :reblogs-count="status.reblogsCount"
              :favourites-count="status.favouritesCount"
              :favourited="status.favourited ?? false"
              :reblogged="status.reblogged ?? false"
              :bookmarked="status.bookmarked ?? false"
              :visibility="status.visibility"
              @reply="openComposer(status)"
              @reblog="handleReblog(status.id)"
              @favourite="handleFavourite(status.id)"
              @bookmark="handleBookmark(status.id)"
            />
          </div>
        </div>
      </article>

      <!-- Descendants -->
      <div v-if="context.descendants.length > 0">
        <div
          v-for="reply in context.descendants"
          :key="reply.id"
          class="border-b border-gray-100 last:border-b-0 transition-colors active:bg-gray-50 dark:border-gray-800 dark:active:bg-gray-800"
          @click="navigateToStatus(reply.id)"
        >
          <article class="px-4 py-3">
            <div class="flex gap-3">
              <router-link :to="getProfileUrl(reply.account.acct)" class="shrink-0" @click.stop>
                <Avatar :src="reply.account.avatar" :alt="reply.account.displayName" size="sm" />
              </router-link>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-1 text-sm">
                  <AccountDisplayName
                    :name="reply.account.displayName || reply.account.username"
                    :emojis="reply.account.emojis"
                    :as-link="true"
                    :href="getProfileUrl(reply.account.acct)"
                    class="truncate text-sm"
                    @click.stop
                  />
                  <AccountHandle :acct="reply.account.acct" class="truncate text-sm" />
                  <span class="text-gray-400">·</span>
                  <RelativeTime :datetime="reply.createdAt" class="text-gray-500" />
                </div>
                <RichText :content="reply.content" :emojis="reply.emojis" class="mt-1 text-gray-900 dark:text-gray-100" />

                <div class="mt-2 flex gap-4 text-sm text-gray-500">
                  <button type="button" class="flex items-center gap-1 active:text-blue-500" @click.stop>
                    <PhChatCircle :size="16" />
                    <span v-if="reply.repliesCount > 0">{{ reply.repliesCount }}</span>
                  </button>
                  <button type="button" class="flex items-center gap-1 active:text-green-500" @click.stop="handleReblog(reply.id)">
                    <PhRepeat :size="16" />
                    <span v-if="reply.reblogsCount > 0">{{ reply.reblogsCount }}</span>
                  </button>
                  <button type="button" class="flex items-center gap-1 active:text-red-500" @click.stop="handleFavourite(reply.id)">
                    <PhHeart :size="16" />
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
:deep(p) {
  margin: 0;
}
</style>
