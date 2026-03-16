<script setup lang="ts">
import { AccountCard } from '@repo/ui';
import { useRouter } from 'vue-router';
import { useData } from '../composables/useData';

const router = useRouter();
const { getTrendingTags, getSuggestedAccounts, getProfileUrl } = useData();

function handleTagClick(tag: string) {
  router.push(`/tags/${encodeURIComponent(tag)}`);
}

function handleProfileClick(acct: string) {
  router.push(getProfileUrl(acct));
}
</script>

<template>
  <div class="flex flex-col">
    <!-- Trending tags -->
    <section class="px-4 py-4">
      <h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Trending Tags
      </h2>
      <div class="space-y-2">
        <button
          v-for="tag in getTrendingTags()"
          :key="tag.name"
          class="block w-full rounded-lg px-3 py-2.5 text-left transition-colors active:bg-gray-100 dark:active:bg-gray-800"
          @click="handleTagClick(tag.name)"
        >
          <span class="font-medium text-gray-900 dark:text-gray-100">#{{ tag.name }}</span>
        </button>
        <p v-if="getTrendingTags().length === 0" class="py-4 text-center text-sm text-gray-500">
          No trending tags
        </p>
      </div>
    </section>

    <!-- Suggested accounts -->
    <section class="border-t border-gray-200 px-4 py-4 dark:border-gray-800">
      <h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Suggested Accounts
      </h2>
      <div class="space-y-3">
        <div v-for="account in getSuggestedAccounts()" :key="account.id" @click="handleProfileClick(account.acct)">
          <AccountCard :account="account" :profile-url="getProfileUrl(account.acct)" show-bio size="sm" />
        </div>
        <p v-if="getSuggestedAccounts().length === 0" class="py-4 text-center text-sm text-gray-500">
          No suggestions
        </p>
      </div>
    </section>
  </div>
</template>
