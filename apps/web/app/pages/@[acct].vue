<script setup lang="ts">
import { useAuth } from '@repo/api';
import {
  Badge,
  EmptyState,
  ProfileActions,
  ProfileHeader,
  ProfileInformation,
  Skeleton,
  TabBar,
  useToast,
} from '@repo/ui';
import { useFollows } from '~/composables/useFollows';

const { handleMute, handleBlock, handleBlockDomain, handleReport } = useWebActions();
const { toast } = useToast();
const HTML_TAG_RE = /<[^>]*>/g;

definePageMeta({});

const route = useRoute();
const router = useRouter();

const { getAccountByAcct, getProfilePath } = useAccountData();
const { toggleFollow, getRelationship, fetchRelationships } = useFollows();

const acct = computed(() => route.params.acct as string);
const isStatusDetail = computed(() => !!route.params.id);

const { currentUser } = useAuth();
const isEditProfileOpen = ref(false);
const { data: account, isLoading: isAccountLoading } = getAccountByAcct(acct.value);
const relationship = computed(() => account.value ? getRelationship(account.value.id) : null);
const isOwnProfile = computed(() => !!currentUser.value && !!account.value && currentUser.value.id === account.value.id);
const isRemoteUser = computed(() => {
  if (!account.value)
    return false;
  return account.value.acct.includes('@');
});

// Set desktop header — show profile info
usePageHeader({
  title: computed(() => account.value?.displayName || account.value?.username || `@${acct.value}`),
  subtitle: computed(() => account.value ? `@${account.value.acct}` : undefined),
  image: computed(() => account.value?.avatar),
});

// Fetch relationship when account loads (skip for own profile)
watch(account, (acc) => {
  if (acc && !(currentUser.value && currentUser.value.id === acc.id)) {
    fetchRelationships([acc.id]);
  }
}, { immediate: true });

// SEO meta tags for link previews (Twitter/Slack/Discord)
useSeoMeta({
  title: () => account.value
    ? `${account.value.displayName || account.value.username} (@${account.value.acct})`
    : `@${acct.value}`,
  ogTitle: () => account.value?.displayName || `@${acct.value}`,
  ogDescription: () => account.value?.note?.replace(HTML_TAG_RE, '').slice(0, 200) || '',
  ogImage: () => account.value?.avatar || '',
  twitterCard: 'summary',
});

// Tab bar
const tabs = [
  { label: 'Posts', value: 'posts' },
  { label: 'Replies', value: 'replies' },
  { label: 'Media', value: 'media' },
];

const activeTab = computed(() => {
  const path = route.path;
  const profileBase = getProfilePath(acct.value);
  if (path === profileBase || path === `${profileBase}/`)
    return 'posts';
  const segment = path.slice(profileBase.length + 1);
  return tabs.find(t => t.value === segment)?.value ?? 'posts';
});

function handleTabChange(tab: string) {
  const base = getProfilePath(acct.value);
  if (tab === 'posts') {
    router.push(base);
  }
  else {
    router.push(`${base}/${tab}`);
  }
}

function handleFollowToggle() {
  if (account.value) {
    toggleFollow(account.value.id);
  }
}

async function handleMessage() {
  if (!account.value)
    return;
  const { findConversationByAcct } = useConversationData();
  const conversationId = await findConversationByAcct(account.value.acct);
  if (conversationId) {
    router.push(`/messages/${conversationId}`);
  }
  else {
    router.push(`/messages/new?acct=${encodeURIComponent(account.value.acct)}`);
  }
}

function handleStatClick(stat: string) {
  if (stat === 'posts')
    window.scrollTo({ top: 0, behavior: 'smooth' });
  else
    router.push(`${getProfilePath(acct.value)}/${stat}`);
}

async function handleCopyProfileLink() {
  const url = `${window.location.origin}${getProfilePath(acct.value)}`;
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Copied');
  }
  catch {
    toast.error('Failed to copy');
  }
}

function handleMuteUser() {
  if (account.value)
    handleMute(account.value.id);
}

function handleBlockUser() {
  if (account.value)
    handleBlock(account.value.id);
}

function handleBlockDomainAction() {
  if (account.value && isRemoteUser.value) {
    const domain = account.value.acct.split('@')[1];
    if (domain)
      handleBlockDomain(domain);
  }
}

function handleReportUser() {
  if (account.value)
    handleReport(account.value.id);
}

function goBack() {
  if (window.history.length > 1) {
    router.back();
  }
  else {
    router.push('/');
  }
}
</script>

<template>
  <div class="w-full">
    <!-- Status detail: render child directly without profile chrome -->
    <template v-if="isStatusDetail">
      <NuxtPage />
    </template>

    <!-- Profile: data-dependent, client-only to avoid hydration mismatch -->
    <ClientOnly v-else>
      <template v-if="account">
        <!-- Profile Header (banner + avatar + back) -->
        <ProfileHeader
          :header-image="account.header"
          :avatar-src="account.avatar"
          :avatar-alt="`${account.displayName}'s avatar`"
          @back="goBack"
        />

        <!-- Follows you badge -->
        <div v-if="relationship?.followedBy" class="flex justify-end px-4 -mb-2">
          <Badge variant="muted">
            Follows you
          </Badge>
        </div>

        <!-- Profile Info Section -->
        <ProfileInformation
          :account="account"
          @profile-click="(acct) => router.push(getProfilePath(acct))"
          @tag-click="(tag) => router.push(`/tags/${tag}`)"
          @stat-click="handleStatClick"
        />

        <!-- Actions row -->
        <div class="border-b border-border px-5 pt-4 pb-4">
          <ProfileActions
            :following="relationship?.following ?? false"
            :requested="relationship?.requested ?? false"
            :is-own-profile="isOwnProfile"
            :is-remote-user="isRemoteUser"
            :remote-profile-url="account?.url"
            @follow="handleFollowToggle"
            @unfollow="handleFollowToggle"
            @message="handleMessage"
            @edit-profile="isEditProfileOpen = true"
            @copy-link="handleCopyProfileLink"
            @mute="handleMuteUser"
            @block="handleBlockUser"
            @block-domain="handleBlockDomainAction"
            @report="handleReportUser"
          />
        </div>

        <!-- Tab bar -->
        <TabBar
          :model-value="activeTab"
          :tabs="tabs"
          @update:model-value="handleTabChange"
        />

        <!-- Child route (posts / replies / media / followers / following) -->
        <NuxtPage />
      </template>

      <!-- Loading -->
      <div v-else-if="isAccountLoading" class="space-y-4 p-4">
        <Skeleton class="h-32 w-full rounded-xl" />
        <div class="flex items-center gap-3 px-1">
          <Skeleton class="size-16 rounded-full" />
          <div class="space-y-2">
            <Skeleton class="h-5 w-32" />
            <Skeleton class="h-3 w-24" />
          </div>
        </div>
      </div>

      <!-- Account not found -->
      <EmptyState
        v-else
        title="User not found"
        description="This account may have been deleted or moved."
        action-label="Go home"
        class="py-12"
        @action="router.push('/')"
      />
    </ClientOnly>

    <!-- Profile Edit Modal -->
    <ClientOnly>
      <ProfileEditModal
        v-if="isOwnProfile"
        :is-open="isEditProfileOpen"
        @close="isEditProfileOpen = false"
      />
    </ClientOnly>
  </div>
</template>
