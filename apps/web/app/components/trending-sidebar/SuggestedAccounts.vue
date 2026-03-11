<script setup lang="ts">
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui';

const suggestedAccounts = [
  {
    id: '1',
    displayName: 'Sarah Chen',
    handle: '@sarahchen@mastodon.social',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    bio: 'Developer & open source enthusiast',
  },
  {
    id: '2',
    displayName: 'Alex Rivera',
    handle: '@alex@fosstodon.org',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    bio: 'Photography & nature lover',
  },
  {
    id: '3',
    displayName: 'Jordan Kim',
    handle: '@jordankim@hachyderm.io',
    avatar: 'https://i.pravatar.cc/150?u=jordan',
    bio: 'Tech writer & coffee addict',
  },
];

const { toggleFollow, isFollowing } = useFollows();

function handleFollow(accountId: string) {
  toggleFollow(accountId);
}
</script>

<template>
  <Card class="rounded-xl border-gray-200 shadow-none">
    <CardHeader class="p-4 pb-0">
      <CardTitle class="text-[13px] font-medium text-gray-500">
        Who to follow
      </CardTitle>
    </CardHeader>
    <CardContent class="p-4 pt-3">
      <ul class="list-none m-0 p-0 space-y-3">
        <li v-for="account in suggestedAccounts" :key="account.id">
          <div class="flex items-start gap-3">
            <img
              :src="account.avatar"
              :alt="account.displayName"
              class="w-10 h-10 rounded-full shrink-0"
            >
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="text-[13px] font-semibold text-gray-900 truncate">
                    {{ account.displayName }}
                  </div>
                  <div class="text-[12px] text-gray-500 truncate">
                    {{ account.handle }}
                  </div>
                </div>
                <button
                  type="button"
                  class="shrink-0 px-3 py-1 text-[12px] font-medium rounded-full transition-colors" :class="[
                    isFollowing(account.id)
                      ? 'text-gray-700 bg-white border border-gray-300 hover:border-red-300 hover:text-red-600'
                      : 'text-gray-900 bg-white border border-gray-300 hover:bg-gray-50',
                  ]"
                  @click="handleFollow(account.id)"
                >
                  {{ isFollowing(account.id) ? 'Following' : 'Follow' }}
                </button>
              </div>
              <p class="text-[12px] text-gray-600 mt-1 line-clamp-1">
                {{ account.bio }}
              </p>
            </div>
          </div>
        </li>
      </ul>
    </CardContent>
    <CardFooter class="px-4 pb-4">
      <NuxtLink
        to="/explore/people"
        class="text-[13px] text-gray-500 hover:text-gray-700 transition-colors"
      >
        See more
      </NuxtLink>
    </CardFooter>
  </Card>
</template>
