<script setup lang="ts">
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
    <!-- Header -->
    <header class="safe-area-top fixed inset-x-0 top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div class="flex h-14 items-center px-4">
        <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Fediway
        </h1>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 pt-[calc(3.5rem+var(--safe-area-inset-top))] pb-[calc(3.5rem+var(--safe-area-inset-bottom))]">
      <slot />
    </main>

    <!-- Tab bar placeholder — will be replaced by AppTabBar in M.02 -->
    <nav class="safe-area-bottom fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div class="flex h-14 items-center justify-around">
        <router-link to="/" class="text-sm text-gray-600 dark:text-gray-400">
          Home
        </router-link>
        <router-link to="/search" class="text-sm text-gray-600 dark:text-gray-400">
          Search
        </router-link>
        <router-link to="/notifications" class="text-sm text-gray-600 dark:text-gray-400">
          Alerts
        </router-link>
        <router-link to="/settings" class="text-sm text-gray-600 dark:text-gray-400">
          Settings
        </router-link>
      </div>
    </nav>
  </div>
</template>
