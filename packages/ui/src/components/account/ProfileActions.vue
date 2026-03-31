<script setup lang="ts">
import {
  PhCopy,
  PhDotsThree,
  PhFlag,
  PhGlobe,
  PhProhibit,
  PhSpeakerSlash,
} from '@phosphor-icons/vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface Props {
  following?: boolean;
  requested?: boolean;
  isOwnProfile?: boolean;
  /** Show "Block domain" and "Open original page" options (for remote/federated users) */
  isRemoteUser?: boolean;
  /** URL to the user's profile on their home instance */
  remoteProfileUrl?: string;
}

const props = withDefaults(defineProps<Props>(), {
  following: false,
  requested: false,
  isOwnProfile: false,
  isRemoteUser: false,
  remoteProfileUrl: undefined,
});

defineEmits<{
  follow: [];
  unfollow: [];
  message: [];
  editProfile: [];
  copyLink: [];
  mute: [];
  block: [];
  blockDomain: [];
  report: [];
}>();
</script>

<template>
  <div data-slot="profile-actions" class="flex items-center gap-3">
    <template v-if="isOwnProfile">
      <button
        type="button"
        class="flex-1 h-[44px] flex items-center justify-center rounded-full text-base font-semibold cursor-pointer transition-colors bg-secondary text-foreground hover:bg-secondary/80"
        @click="$emit('editProfile')"
      >
        Edit Profile
      </button>
    </template>

    <template v-else>
      <button
        type="button"
        class="flex-1 h-[44px] flex items-center justify-center rounded-full text-base font-semibold cursor-pointer transition-colors"
        :class="[
          props.following || props.requested
            ? 'bg-secondary text-foreground hover:bg-secondary/80'
            : 'bg-foreground text-background hover:bg-foreground/90',
        ]"
        @click="props.following ? $emit('unfollow') : $emit('follow')"
      >
        {{ props.requested ? 'Requested' : props.following ? 'Following' : 'Follow' }}
      </button>

      <button
        type="button"
        class="flex-1 h-[44px] flex items-center justify-center rounded-full text-base font-semibold cursor-pointer transition-colors bg-secondary text-foreground hover:bg-secondary/80"
        @click="$emit('message')"
      >
        Message
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <button
            type="button"
            class="size-[44px] shrink-0 flex items-center justify-center rounded-full cursor-pointer transition-colors bg-secondary text-foreground hover:bg-secondary/80"
            aria-label="More actions"
          >
            <PhDotsThree :size="24" weight="bold" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="end" :side-offset="8">
          <DropdownMenuItem @select="$emit('copyLink')">
            <PhCopy :size="16" class="text-muted-foreground" />
            Copy profile link
          </DropdownMenuItem>

          <template v-if="isRemoteUser && remoteProfileUrl">
            <DropdownMenuItem as="a" :href="remoteProfileUrl" target="_blank" rel="noopener noreferrer">
              <PhGlobe :size="16" class="text-muted-foreground" />
              Open original page
            </DropdownMenuItem>
          </template>

          <DropdownMenuSeparator />

          <DropdownMenuItem @select="$emit('mute')">
            <PhSpeakerSlash :size="16" class="text-muted-foreground" />
            Mute user
          </DropdownMenuItem>
          <DropdownMenuItem @select="$emit('block')">
            <PhProhibit :size="16" class="text-muted-foreground" />
            Block user
          </DropdownMenuItem>

          <template v-if="isRemoteUser">
            <DropdownMenuItem @select="$emit('blockDomain')">
              <PhProhibit :size="16" class="text-muted-foreground" />
              Block domain
            </DropdownMenuItem>
          </template>

          <DropdownMenuSeparator />

          <DropdownMenuItem destructive @select="$emit('report')">
            <PhFlag :size="16" />
            Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </template>
  </div>
</template>
