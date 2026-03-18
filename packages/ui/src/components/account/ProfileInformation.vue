<script setup lang="ts">
import type { Account } from '@repo/types';
import { computed } from 'vue';
import { RichText } from '../ui/rich-text';

const props = defineProps<{
  account: Account;
}>();

const stats = computed(() => [
  { count: props.account.statusesCount, label: 'Posts' },
  { count: props.account.followersCount, label: 'Followers' },
  { count: props.account.followingCount, label: 'Following' },
]);

const accountAge = computed(() => {
  if (!props.account.createdAt)
    return null;
  const created = new Date(props.account.createdAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - created.getTime()) / 86400000);
  if (diffDays < 30)
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears !== 1 ? 's' : ''}`;
});

const HREF_RE = /<a[^>]*href="([^"]*)"[^>]*>/i;
const STRIP_TAGS_RE = /<[^>]*>/g;

function extractHref(html: string): string | null {
  const match = html.match(HREF_RE);
  return match?.[1] ?? null;
}

function extractText(html: string): string {
  return html.replace(STRIP_TAGS_RE, '').trim();
}
</script>

<template>
  <div class="flex flex-col gap-3 px-5">
    <!-- Display Name + Handle -->
    <div class="flex flex-col gap-0.5">
      <p class="text-[22px] font-bold leading-normal text-foreground">
        {{ account.displayName || account.username }}
      </p>
      <p class="text-sm text-foreground/80">
        @{{ account.acct }}
      </p>
    </div>

    <!-- Bio (HTML via RichText) -->
    <RichText
      v-if="account.note"
      :content="account.note"
      :emojis="account.emojis"
      class="text-base leading-[22px] text-foreground"
    />

    <!-- Stats -->
    <div v-if="stats.length" class="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="flex items-baseline gap-[3px]"
      >
        <span class="text-base font-bold text-foreground">{{ stat.count.toLocaleString() }}</span>
        <span class="text-sm text-foreground/80">{{ stat.label }}</span>
      </div>
    </div>

    <!-- Profile fields + Join date -->
    <div v-if="account.fields.length > 0 || accountAge" class="flex flex-wrap items-center gap-2 text-sm text-foreground/60">
      <div v-if="accountAge" class="inline-flex items-center gap-1.5">
        <span>Joined {{ accountAge }} ago</span>
      </div>
      <template v-for="field in account.fields" :key="field.name">
        <a
          v-if="extractHref(field.value)"
          :href="extractHref(field.value) ?? undefined"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          :class="{ 'text-green': field.verifiedAt }"
        >
          <span>{{ extractText(field.value) }}</span>
          <svg v-if="field.verifiedAt" class="size-4 text-green" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </a>
        <span v-else>{{ extractText(field.value) }}</span>
      </template>
    </div>
  </div>
</template>
