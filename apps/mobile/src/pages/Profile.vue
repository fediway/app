<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <div class="p-4">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
      Profile
    </h2>
    <p class="mt-2 text-sm text-gray-500">
      {{ route.params.acct }}
    </p>
  </div>
</template>
