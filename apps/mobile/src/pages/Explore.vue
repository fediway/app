<script setup lang="ts">
import type { Account, Tag } from '@repo/types';
import { PhWarningCircle } from '@phosphor-icons/vue';
import { AccountCard, EmptyState, ListHeader, Skeleton, TagListItem } from '@repo/ui';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getProfileUrl, getSafeClient } from '../composables/useStatusBridge';

const router = useRouter();

const trendingTags = ref<Tag[]>([]);
const suggestedAccounts = ref<Account[]>([]);
const loading = ref(true);
const error = ref<Error | null>(null);

async function load() {
  loading.value = true;
  error.value = null;
  const client = getSafeClient();
  if (!client)
    return;
  try {
    const [tags, suggestions] = await Promise.all([
      client.rest.v1.trends.tags.list(),
      client.rest.v1.suggestions.list(),
    ]);
    trendingTags.value = tags;
    suggestedAccounts.value = suggestions.map((s: any) => s.account);
  }
  catch (e) {
    error.value = e instanceof Error ? e : new Error('Failed to load explore data');
  }
  finally {
    loading.value = false;
  }
}

function handleTagClick(name: string) {
  router.push(`/tags/${encodeURIComponent(name)}`);
}

function handleProfileClick(acct: string) {
  router.push(getProfileUrl(acct));
}

onMounted(load);
</script>

<template>
  <EmptyState
    v-if="error && trendingTags.length === 0 && suggestedAccounts.length === 0"
    :icon="PhWarningCircle"
    title="Couldn't load explore data"
    action-label="Try again"
    @action="load"
  />

  <div v-else-if="loading && trendingTags.length === 0 && suggestedAccounts.length === 0" class="space-y-4 p-4">
    <Skeleton class="h-6 w-32" />
    <Skeleton v-for="i in 5" :key="i" class="h-10 w-full" />
    <Skeleton class="mt-4 h-6 w-40" />
    <Skeleton v-for="i in 3" :key="`a${i}`" class="h-16 w-full" />
  </div>

  <div v-else class="flex flex-col">
    <section class="px-4 py-4">
      <ListHeader title="Trending Tags" class="mb-3" />
      <div class="space-y-1">
        <TagListItem
          v-for="tag in trendingTags"
          :key="tag.name"
          :name="tag.name"
          @click="handleTagClick(tag.name)"
        />
      </div>
      <EmptyState v-if="trendingTags.length === 0" title="No trending tags" />
    </section>

    <section class="border-t border-gray-200 px-4 py-4 dark:border-gray-800">
      <ListHeader title="Suggested Accounts" class="mb-3" />
      <div class="space-y-3">
        <div v-for="account in suggestedAccounts" :key="account.id" @click="handleProfileClick(account.acct)">
          <AccountCard :account="account" :profile-url="getProfileUrl(account.acct)" show-bio size="sm" />
        </div>
      </div>
      <EmptyState v-if="suggestedAccounts.length === 0" title="No suggestions" />
    </section>
  </div>
</template>
