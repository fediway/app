<script setup lang="ts">
const route = useRoute();
const showSearch = computed(() => !route.path.startsWith('/explore') && !route.path.startsWith('/search'));
</script>

<template>
  <!-- Sticky scroll container: viewport height, scrolls independently from feed -->
  <div class="sidebar-scroll lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
    <!-- Search: sticky within the sidebar scroll, hidden on explore/search pages -->
    <div class="lg:sticky lg:top-0 lg:z-10 lg:bg-background lg:pt-14" :class="showSearch ? 'lg:pb-4' : ''">
      <SidebarSearch v-if="showSearch" />
    </div>
    <!-- Sidebar content -->
    <TrendingSidebar />
  </div>
</template>

<style scoped>
/* Thin scrollbar that appears on hover */
.sidebar-scroll::-webkit-scrollbar {
  width: 4px;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 4px;
}

.sidebar-scroll:hover::-webkit-scrollbar-thumb {
  background-color: rgb(156 163 175 / 0.3);
}

.sidebar-scroll {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.sidebar-scroll:hover {
  scrollbar-color: rgb(156 163 175 / 0.3) transparent;
}
</style>
