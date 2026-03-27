<script setup lang="ts">
import { InputGroup, InputGroupAddon, InputGroupInput, NavIcon } from '@repo/ui';
import { ref } from 'vue';

const searchQuery = ref('');

function handleSearch() {
  if (searchQuery.value.trim()) {
    navigateTo({ path: '/search', query: { q: searchQuery.value } });
  }
}
</script>

<template>
  <InputGroup class="rounded-xl border-border bg-card py-0.5">
    <InputGroupAddon>
      <NavIcon name="search" :size="18" class="text-muted-foreground/70" />
    </InputGroupAddon>
    <InputGroupInput
      v-model="searchQuery"
      placeholder="Search"
      class="text-base placeholder:text-muted-foreground/70"
      @keydown.enter="handleSearch"
    />
  </InputGroup>
</template>
