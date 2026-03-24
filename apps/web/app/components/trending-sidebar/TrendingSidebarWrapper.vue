<script setup lang="ts">
const route = useRoute();
const showSearch = computed(() => !route.path.startsWith('/explore') && !route.path.startsWith('/search'));

const searchRef = ref<HTMLElement>();
const contentRef = ref<HTMLElement>();
const contentTop = ref('0px');

function updateContentTop() {
  if (!contentRef.value)
    return;
  const searchHeight = searchRef.value?.offsetHeight ?? 0;
  const contentHeight = contentRef.value.offsetHeight;
  const vh = window.innerHeight;
  // Stick right below search (or top if no search), or stick when bottom reaches viewport bottom
  const topBelowSearch = showSearch.value ? searchHeight : 56; // 56px = pt-14 alignment
  contentTop.value = `${Math.min(topBelowSearch, vh - contentHeight)}px`;
}

let observer: ResizeObserver | null = null;

onMounted(() => {
  updateContentTop();
  window.addEventListener('resize', updateContentTop);
  if (contentRef.value) {
    observer = new ResizeObserver(updateContentTop);
    observer.observe(contentRef.value);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateContentTop);
  observer?.disconnect();
});

watch(showSearch, () => nextTick(updateContentTop));
</script>

<template>
  <div class="lg:h-full">
    <!-- Search: fixed at top, hidden on explore pages (explore has its own search) -->
    <div v-if="showSearch" ref="searchRef" class="lg:sticky lg:top-0 lg:z-10 lg:bg-gray-100 lg:pt-14 lg:pb-4 dark:lg:bg-gray-950">
      <SidebarSearch />
    </div>
    <!-- Content: scrolls with page, stops when bottom reaches viewport bottom -->
    <div ref="contentRef" class="lg:sticky" :style="{ top: contentTop }">
      <TrendingSidebar />
    </div>
  </div>
</template>
