<script setup lang="ts">
import type { Account } from '@repo/types';
import { computed } from 'vue';
import { formatRelativeDuration } from '../../utils/date';
import { formatCount } from '../../utils/format';
import { Badge } from '../ui/badge';
import { RichText } from '../ui/rich-text';
import AccountDisplayName from './AccountDisplayName.vue';

const props = defineProps<{
  account: Account;
}>();

const emit = defineEmits<{
  profileClick: [acct: string];
  tagClick: [tag: string];
  statClick: [stat: 'followers' | 'following' | 'posts'];
}>();

const stats = computed(() => [
  { key: 'followers' as const, count: props.account.followersCount, label: 'Followers' },
  { key: 'following' as const, count: props.account.followingCount, label: 'Following' },
  { key: 'posts' as const, count: props.account.statusesCount, label: 'Posts' },
]);

const accountAge = computed(() =>
  props.account.createdAt ? formatRelativeDuration(props.account.createdAt) : null,
);

const HREF_RE = /<a[^>]*href="([^"]*)"[^>]*>/i;
const STRIP_TAGS_RE = /<[^>]*>/g;

function extractHref(html: string): string | null {
  const match = html.match(HREF_RE);
  return match?.[1] ?? null;
}

function extractText(html: string): string {
  const text = html.replace(STRIP_TAGS_RE, '').trim();
  // Clean up URLs for display: strip protocol + trailing slash
  // "https://fediway.com/" → "fediway.com"
  // "https://www.example.com/about" → "example.com/about"
  return text
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
}
</script>

<template>
  <div class="flex flex-col gap-3 px-5 pt-1">
    <!-- Display Name + Handle -->
    <div class="flex flex-col">
      <AccountDisplayName
        :name="account.displayName || account.username"
        :emojis="account.emojis"
        class="text-xl font-bold leading-normal text-foreground"
      />
      <p class="text-sm text-muted-foreground">
        @{{ account.acct }}
      </p>
    </div>

    <!-- Stats -->
    <div v-if="stats.length" class="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <button
        v-for="stat in stats"
        :key="stat.key"
        type="button"
        class="flex cursor-pointer items-baseline gap-[3px] rounded-sm transition-colors hover:text-foreground"
        @click="emit('statClick', stat.key)"
      >
        <span class="text-base font-bold text-foreground">{{ formatCount(stat.count) }}</span>
        <span class="text-base text-muted-foreground">{{ stat.label }}</span>
      </button>
    </div>

    <!-- Bio (HTML via RichText) -->
    <RichText
      v-if="account.note"
      :content="account.note"
      :emojis="account.emojis"
      class="text-base leading-[22px] text-foreground"
      @mention-click="emit('profileClick', $event)"
      @hashtag-click="emit('tagClick', $event)"
    />

    <!-- Profile fields + Join date -->
    <div v-if="account.fields.length > 0 || accountAge" class="flex flex-wrap items-center gap-2">
      <Badge v-if="accountAge" variant="muted">
        Joined {{ accountAge }}
      </Badge>
      <template v-for="field in account.fields" :key="field.name">
        <a
          v-if="extractHref(field.value)"
          :href="extractHref(field.value) ?? undefined"
          target="_blank"
          rel="noopener noreferrer"
          class="no-underline"
        >
          <Badge :variant="field.verifiedAt ? 'default' : 'muted'" class="gap-1 transition-colors hover:opacity-80">
            <span class="text-muted-foreground">{{ field.name }}</span> {{ extractText(field.value) }}
            <svg v-if="field.verifiedAt" class="size-4 text-green" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </Badge>
        </a>
        <Badge v-else variant="muted">
          <span class="text-muted-foreground">{{ field.name }}</span> {{ extractText(field.value) }}
        </Badge>
      </template>
    </div>
  </div>
</template>
