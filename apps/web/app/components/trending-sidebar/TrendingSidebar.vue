<template>
  <div class="flex flex-col gap-4">
    <TrendingNews />
    <ClientOnly>
      <TrendingTags />
    </ClientOnly>
    <ClientOnly>
      <SuggestedAccounts />
    </ClientOnly>
    <SidebarFooter />
  </div>
</template>
