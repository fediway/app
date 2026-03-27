<script setup lang="ts">
import type { Status } from '@repo/types';
import { PhChatCircle, PhHeart, PhRepeat } from '@phosphor-icons/vue';
import AccountDisplayName from '../account/AccountDisplayName.vue';
import AccountHandle from '../account/AccountHandle.vue';
import Avatar from '../ui/avatar/Avatar.vue';
import RelativeTime from '../ui/relative-time/RelativeTime.vue';
import RichText from '../ui/rich-text/RichText.vue';

defineProps<{
  status: Status;
}>();

const emit = defineEmits<{
  click: [statusId: string];
  reply: [statusId: string];
  reblog: [statusId: string];
  favourite: [statusId: string];
  profileClick: [acct: string];
  tagClick: [tagName: string];
}>();
</script>

<template>
  <div
    class="cursor-pointer border-b border-border last:border-b-0 transition-colors hover:bg-foreground/[0.03] active:bg-foreground/[0.03]"
    @click="emit('click', status.id)"
  >
    <article class="px-4 py-3">
      <div class="flex gap-3">
        <button type="button" class="shrink-0" @click.stop="emit('profileClick', status.account.acct)">
          <Avatar :src="status.account.avatar" :alt="status.account.displayName" size="sm" />
        </button>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-1 text-sm">
            <AccountDisplayName
              :name="status.account.displayName || status.account.username"
              :emojis="status.account.emojis"
              class="truncate text-sm"
              @click.stop="emit('profileClick', status.account.acct)"
            />
            <AccountHandle :acct="status.account.acct" class="truncate text-sm" />
            <span class="text-muted-foreground">·</span>
            <RelativeTime :datetime="status.createdAt" />
          </div>
          <RichText
            :content="status.content"
            :emojis="status.emojis"
            :mentions="status.mentions"
            class="mt-1 text-foreground"
            @mention-click="emit('profileClick', $event)"
            @hashtag-click="emit('tagClick', $event)"
          />

          <!-- Compact reply actions -->
          <div class="mt-2 flex gap-4 text-sm text-primary/60">
            <button
              type="button"
              class="flex items-center gap-1 hover:text-foreground active:text-foreground"
              @click.stop="emit('reply', status.id)"
            >
              <PhChatCircle :size="16" />
              <span v-if="status.repliesCount > 0">{{ status.repliesCount }}</span>
            </button>
            <button
              type="button"
              class="flex items-center gap-1 hover:text-foreground active:text-foreground"
              @click.stop="emit('reblog', status.id)"
            >
              <PhRepeat :size="16" />
              <span v-if="status.reblogsCount > 0">{{ status.reblogsCount }}</span>
            </button>
            <button
              type="button"
              class="flex items-center gap-1 hover:text-foreground active:text-foreground"
              @click.stop="emit('favourite', status.id)"
            >
              <PhHeart :size="16" />
              <span v-if="status.favouritesCount > 0">{{ status.favouritesCount }}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>
