<script setup lang="ts">
import { useAuth } from '@repo/api';
import { Avatar, Button, PageHeader, SettingsNavItem, SettingsSection } from '@repo/ui';
import { useNavigationStore } from '~/stores/navigation';

const router = useRouter();
const navigation = useNavigationStore();
const { isAuthenticated, instanceUrl, logout: apiLogout } = useAuth();
const isEditProfileOpen = ref(false);

usePageHeader({ title: 'Settings' });

function handleLogout() {
  useAnalytics().trackLogout();
  apiLogout();
  router.push('/');
}
</script>

<template>
  <div class="w-full max-w-2xl">
    <PageHeader title="Settings" class="lg:hidden" />

    <!-- Profile Card -->
    <section class="border-b border-border px-4 py-5">
      <div v-if="navigation.currentUser" class="flex items-center gap-4">
        <Avatar :src="navigation.currentUser.avatar" :alt="navigation.currentUser.name" size="lg" />
        <div class="min-w-0 flex-1">
          <div class="font-semibold text-foreground">
            {{ navigation.currentUser.name }}
          </div>
          <div class="text-sm text-muted-foreground">
            @{{ navigation.currentUser.acct }}
          </div>
        </div>
        <Button variant="muted" size="sm" @click="isEditProfileOpen = true">
          Edit
        </Button>
      </div>
    </section>

    <!-- Account -->
    <SettingsSection title="Account">
      <div class="text-sm">
        <div v-if="isAuthenticated" class="flex items-center gap-2">
          <span class="size-2 rounded-full bg-green" />
          <span class="text-foreground">Connected to {{ instanceUrl }}</span>
        </div>
        <div v-else class="flex items-center gap-2">
          <span class="size-2 rounded-full bg-yellow" />
          <span class="text-foreground">Not connected</span>
        </div>
      </div>
    </SettingsSection>

    <!-- Settings categories -->
    <section class="border-b border-border px-4 py-4">
      <div class="-mx-2 space-y-1">
        <SettingsNavItem to="/settings/privacy" label="Privacy & safety" />
        <SettingsNavItem to="/settings/notifications" label="Notifications" />
        <SettingsNavItem to="/settings/appearance" label="Appearance" />
      </div>
    </section>

    <!-- Log out -->
    <section v-if="isAuthenticated" class="px-4 py-6">
      <Button
        variant="muted"
        class="w-full text-red"
        @click="handleLogout"
      >
        Log out
      </Button>
    </section>

    <!-- Profile Edit Modal -->
    <ClientOnly>
      <ProfileEditModal
        :is-open="isEditProfileOpen"
        @close="isEditProfileOpen = false"
      />
    </ClientOnly>
  </div>
</template>
