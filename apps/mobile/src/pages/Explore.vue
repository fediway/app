<script setup lang="ts">
import type { Account, Tag } from '@repo/types';
import { AccountCard } from '@repo/ui';
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

function handleTagClick(tag: string) {
  router.push(`/tags/${encodeURIComponent(tag)}`);
}

function handleProfileClick(acct: string) {
  router.push(getProfileUrl(acct));
}

onMounted(load);
</script>

<template>
  <div v-if="error && trendingTags.length === 0 && suggestedAccounts.length === 0" class="flex flex-col items-center justify-center gap-3 py-20">
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Couldn't load explore data
    </p>
    <button class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium dark:bg-gray-800" @click="load()">
      Try again
    </button>
  </div>

  <div v-else class="flex flex-col">
    <div v-if="loading && trendingTags.length === 0 && suggestedAccounts.length === 0" class="flex items-center justify-center py-20">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Loading…
      </p>
    </div>

    <template v-else>
      <section class="px-4 py-4">
        <h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Trending Tags
        </h2>
        <div class="space-y-2">
          <button
            v-for="tag in trendingTags"
            :key="tag.name"
            class="block w-full rounded-lg px-3 py-2.5 text-left transition-colors active:bg-gray-100 dark:active:bg-gray-800"
            @click="handleTagClick(tag.name)"
          >
            <span class="font-medium text-gray-900 dark:text-gray-100">#{{ tag.name }}</span>
          </button>
          <p v-if="trendingTags.length === 0" class="py-4 text-center text-sm text-gray-500">
            No trending tags
          </p>
        </div>
      </section>

      <section class="border-t border-gray-200 px-4 py-4 dark:border-gray-800">
        <h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Suggested Accounts
        </h2>
        <div class="space-y-3">
          <div v-for="account in suggestedAccounts" :key="account.id" @click="handleProfileClick(account.acct)">
            <AccountCard :account="account" :profile-url="getProfileUrl(account.acct)" show-bio size="sm" />
          </div>
          <p v-if="suggestedAccounts.length === 0" class="py-4 text-center text-sm text-gray-500">
            No suggestions
          </p>
        </div>
      </section>
    </template>
  </div>
</template>
