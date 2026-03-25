<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  /** Full acct (user@instance.social or just user for local) */
  acct: string;
  /** Whether to show the full acct with instance */
  showInstance?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showInstance: true,
});

const formattedHandle = computed(() => {
  const handle = props.acct.startsWith('@') ? props.acct : `@${props.acct}`;

  if (!props.showInstance && handle.includes('@', 1)) {
    // Return just @username without instance
    return `${handle.split('@')[0]}@${handle.split('@')[1]}`;
  }

  return handle;
});
</script>

<template>
  <span class="text-gray-400 dark:text-gray-500 break-all">
    {{ formattedHandle }}
  </span>
</template>
