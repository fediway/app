<script setup lang="ts">
import type { Component } from 'vue';
import type { NotificationGroup } from './groupNotifications';
import { PhArrowsClockwise, PhBell, PhChartBar, PhChatCircle, PhConfetti, PhFlag, PhHeart, PhLinkBreak, PhMegaphone, PhPencilSimple, PhQuotes, PhUserCheck, PhUserPlus, PhWarning } from '@phosphor-icons/vue';
import { computed } from 'vue';
import Avatar from '../ui/avatar/Avatar.vue';
import Button from '../ui/button/Button.vue';
import RelativeTime from '../ui/relative-time/RelativeTime.vue';

const props = defineProps<{
  group: NotificationGroup;
  unread?: boolean;
  showFollowBack?: boolean;
}>();

const emit = defineEmits<{
  click: [group: NotificationGroup];
  profileClick: [acct: string];
  followBack: [acct: string];
  acceptRequest: [accountId: string];
  rejectRequest: [accountId: string];
}>();

interface TypeConfig {
  icon: Component;
  color: string;
  text: string;
}

const TYPE_MAP: Record<string, TypeConfig> = {
  'favourite': { icon: PhHeart, color: 'text-rose-500', text: 'liked your post' },
  'reblog': { icon: PhArrowsClockwise, color: 'text-green-600 dark:text-green-500', text: 'reposted your post' },
  'follow': { icon: PhUserPlus, color: 'text-galaxy-500 dark:text-galaxy-400', text: 'followed you' },
  'follow_request': { icon: PhUserCheck, color: 'text-galaxy-500 dark:text-galaxy-400', text: 'requested to follow you' },
  'mention': { icon: PhChatCircle, color: 'text-galaxy-500 dark:text-galaxy-400', text: 'mentioned you' },
  'status': { icon: PhMegaphone, color: 'text-galaxy-500 dark:text-galaxy-400', text: 'posted' },
  'poll': { icon: PhChartBar, color: 'text-amber-500', text: 'A poll you voted in has ended' },
  'update': { icon: PhPencilSimple, color: 'text-galaxy-500 dark:text-galaxy-400', text: 'edited a post' },
  'quote': { icon: PhQuotes, color: 'text-galaxy-500 dark:text-galaxy-400', text: 'quoted your post' },
  'quoted_update': { icon: PhPencilSimple, color: 'text-galaxy-500 dark:text-galaxy-400', text: 'edited a post you quoted' },
  'severed_relationships': { icon: PhLinkBreak, color: 'text-rose-500', text: 'Some follow relationships were severed' },
  'moderation_warning': { icon: PhWarning, color: 'text-amber-500', text: 'You received a moderation warning' },
  'admin.sign_up': { icon: PhConfetti, color: 'text-violet-500', text: 'signed up' },
  'admin.report': { icon: PhFlag, color: 'text-rose-500', text: 'submitted a report' },
};

const config = computed(() => TYPE_MAP[props.group.type] ?? { icon: PhBell, color: 'text-muted-foreground', text: 'interacted with you' });

const displayAccounts = computed(() => props.group.accounts.slice(0, 5));
const extraCount = computed(() => Math.max(0, props.group.totalCount - displayAccounts.value.length));
const firstAccount = computed(() => props.group.accounts[0]);

const namesHtml = computed(() => {
  const names = displayAccounts.value.map(a => a.displayName || a.username);
  if (props.group.type === 'poll')
    return '';
  if (names.length === 0)
    return '';
  if (names.length === 1)
    return names[0];
  if (extraCount.value === 0)
    return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
  return `${names[0]} and ${extraCount.value + names.length - 1} others`;
});

const statusExcerpt = computed(() => {
  if (!props.group.status)
    return '';
  return props.group.status.content
    .replace(/<p[^>]*>\s*RE:\s*<a[^>]*>[^<]*<\/a>\s*<\/p>/i, '')
    .replace(/<p[^>]*>\s*RE:\s*https?:\/\/\S+\s*<\/p>/i, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/@\S+/g, '')
    .trim()
    .slice(0, 150);
});

const firstMediaUrl = computed(() => {
  const media = props.group.status?.mediaAttachments[0];
  if (!media)
    return null;
  return media.previewUrl ?? media.url;
});

const isMention = computed(() => props.group.type === 'mention' || props.group.type === 'status');
const isFollow = computed(() => props.group.type === 'follow');
const isFollowRequest = computed(() => props.group.type === 'follow_request');
const isSingleAccount = computed(() => props.group.accounts.length === 1);
const hasRightAction = computed(() =>
  (isFollow.value && props.showFollowBack)
  || (isFollowRequest.value && isSingleAccount.value)
  || firstMediaUrl.value,
);
</script>

<template>
  <div
    class="flex w-full cursor-pointer gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/[0.03]"
    :class="unread ? 'bg-galaxy-50/50 dark:bg-galaxy-950/20' : ''"
    @click="emit('click', group)"
  >
    <div class="min-w-0 flex-1">
      <!-- Avatar stack + type icon -->
      <div class="mb-1.5 flex items-center">
        <div class="flex -space-x-1.5">
          <button
            v-for="account in displayAccounts"
            :key="account.id"
            type="button"
            class="relative cursor-pointer rounded-full ring-2 ring-card"
            @click.stop="emit('profileClick', account.acct)"
          >
            <Avatar :src="account.avatar" :alt="account.displayName" size="sm" />
          </button>
        </div>
        <span v-if="extraCount > 0" class="ml-1.5 text-xs text-muted-foreground">
          +{{ extraCount }}
        </span>
        <component
          :is="config.icon"
          :class="config.color"
          class="ml-auto shrink-0"
          :size="16"
          weight="fill"
        />
      </div>

      <!-- Text + right action -->
      <div class="flex items-start gap-3">
        <div class="min-w-0 flex-1">
          <!-- Name + action + time -->
          <p class="flex flex-wrap items-baseline gap-x-1 text-sm leading-snug">
            <button
              v-if="isSingleAccount"
              type="button"
              class="cursor-pointer font-semibold text-foreground hover:underline"
              @click.stop="firstAccount && emit('profileClick', firstAccount.acct)"
            >
              {{ namesHtml }}
            </button>
            <span v-else class="font-semibold text-foreground">
              {{ namesHtml }}
            </span>
            <span class="text-muted-foreground">{{ config.text }}</span>
            <span class="text-muted-foreground-subtle">·</span>
            <RelativeTime :datetime="group.createdAt" class="text-xs text-muted-foreground-subtle" />
          </p>

          <!-- Status excerpt -->
          <p
            v-if="statusExcerpt && !isMention"
            class="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground"
          >
            {{ statusExcerpt }}
          </p>
          <p
            v-else-if="statusExcerpt && isMention"
            class="mt-1 line-clamp-3 text-sm leading-snug text-foreground"
          >
            {{ statusExcerpt }}
          </p>
        </div>

        <!-- Right: buttons or media -->
        <div v-if="hasRightAction" class="shrink-0 self-center" @click.stop>
          <Button
            v-if="isFollow && showFollowBack && firstAccount"
            size="sm"
            variant="secondary"
            @click="emit('followBack', firstAccount.acct)"
          >
            Follow back
          </Button>

          <div v-else-if="isFollowRequest && isSingleAccount && firstAccount" class="flex gap-2">
            <Button size="sm" @click="emit('acceptRequest', firstAccount.id)">
              Confirm
            </Button>
            <Button size="sm" variant="muted" @click="emit('rejectRequest', firstAccount.id)">
              Delete
            </Button>
          </div>

          <img
            v-else-if="firstMediaUrl"
            :src="firstMediaUrl"
            alt=""
            class="size-12 rounded-lg object-cover"
            loading="lazy"
            decoding="async"
          >
        </div>
      </div>
    </div>
  </div>
</template>
