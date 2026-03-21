<script setup lang="ts">
import { ref, watch } from 'vue';
import { useNavigationStore } from '~/stores/navigation';

const route = useRoute();
const navigation = useNavigationStore();
const announcement = ref('');

// Announce page on route change for screen readers
watch(() => route.path, () => {
  announcement.value = '';
  nextTick(() => {
    announcement.value = getAnnouncement();
  });
});

function getAnnouncement(): string {
  const path = route.path;

  // Detail pages — derive from route params
  if (path.startsWith('/@') && route.params.id)
    return 'Post detail';
  if (path.startsWith('/@'))
    return 'Profile';
  if (path.startsWith('/tags/'))
    return `Hashtag ${route.params.tag}`;
  if (path.startsWith('/links/'))
    return 'Shared link';
  if (path.startsWith('/messages/') && route.params.id)
    return 'Conversation';

  // Everything else — use navigation store title (Home, Explore, Notifications, etc.)
  return navigation.pageTitle;
}
</script>

<template>
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    class="sr-only"
  >
    {{ announcement }}
  </div>
</template>
