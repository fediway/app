<script setup lang="ts">
import type { Account } from '@repo/types';
import { computed } from 'vue';
import RichText from '../primitives/RichText.vue';
import AccountHandle from './AccountHandle.vue';

interface Props {
  account: Account;
}

const props = defineProps<Props>();

// Format account age as relative time
const accountAge = computed(() => {
  if (!props.account.createdAt)
    return null;

  const created = new Date(props.account.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears !== 1 ? 's' : ''}`;
});

// Get icon type based on field name
function getFieldIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('website') || lower.includes('site') || lower.includes('blog'))
    return 'link';
  if (lower.includes('location') || lower.includes('place') || lower.includes('city'))
    return 'location';
  if (lower.includes('github'))
    return 'github';
  if (lower.includes('twitter') || lower.includes('x.com'))
    return 'twitter';
  if (lower.includes('email') || lower.includes('mail'))
    return 'email';
  return 'link';
}

// Extract href URL from HTML value
function extractHref(html: string): string | null {
  const match = html.match(/<a[^>]*href="([^"]*)"[^>]*>/i);
  return match && match[1] ? match[1] : null;
}

// Extract display text from HTML value (strip tags for badge display)
function extractLinkText(html: string): string {
  // Try to extract href and text from anchor tags
  const match = html.match(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/i);
  if (match && match[1] && match[2]) {
    const href = match[1];
    const text = match[2].trim();
    // Return the link text, or clean up the URL if text is same as href
    if (text && !text.startsWith('http')) {
      return text;
    }
    // Clean up URL for display
    try {
      const url = new URL(href);
      return url.hostname.replace('www.', '');
    }
    catch {
      return text || href;
    }
  }
  // Strip all HTML tags
  return html.replace(/<[^>]*>/g, '').trim();
}
</script>

<template>
  <div>
    <!-- Display Name and Handle -->
    <div class="mb-3">
      <h1 class="text-[22px] font-bold text-gray-900 m-0 mb-0.5 leading-tight">
        {{ props.account.displayName || props.account.username }}
      </h1>
      <p class="text-[15px] text-gray-500 m-0">
        <AccountHandle :acct="props.account.acct" />
      </p>
    </div>

    <!-- Bio -->
    <div v-if="props.account.note" class="text-[15px] text-gray-700 mb-3">
      <RichText :content="props.account.note" :emojis="props.account.emojis" />
    </div>

    <!-- Profile fields as badges + Join date -->
    <div class="flex flex-wrap items-center gap-2 text-sm text-gray-500">
      <!-- Account age -->
      <div v-if="accountAge" class="inline-flex items-center gap-1.5">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>Joined {{ accountAge }} ago</span>
      </div>

      <!-- Profile fields as badges -->
      <template v-for="field in props.account.fields" :key="field.name">
        <a
          v-if="extractHref(field.value)"
          :href="extractHref(field.value) ?? undefined"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 hover:text-gray-900 transition-colors"
          :class="{ 'text-green-600': field.verifiedAt }"
        >
          <!-- Icon based on field type -->
          <svg v-if="getFieldIcon(field.name) === 'link'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <svg v-else-if="getFieldIcon(field.name) === 'location'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <svg v-else-if="getFieldIcon(field.name) === 'github'" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span>{{ extractLinkText(field.value) }}</span>
          <!-- Verified badge -->
          <svg
            v-if="field.verifiedAt"
            class="w-4 h-4 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
        </a>
        <!-- Non-link fields -->
        <div v-else class="inline-flex items-center gap-1.5">
          <svg v-if="getFieldIcon(field.name) === 'location'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>{{ extractLinkText(field.value) }}</span>
        </div>
      </template>
    </div>
  </div>
</template>
