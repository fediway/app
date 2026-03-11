<script setup lang="ts">
import { InputGroup, InputGroupAddon, InputGroupInput } from '@repo/ui';
import { ref } from 'vue';

const searchQuery = ref('');

function handleSearch() {
  if (searchQuery.value.trim()) {
    navigateTo({ path: '/search', query: { q: searchQuery.value } });
  }
}
</script>

<template>
  <InputGroup class="rounded-xl border-gray-200 bg-white py-0.5">
    <InputGroupAddon>
      <NavIcon name="search" :size="18" class="text-gray-400" />
    </InputGroupAddon>
    <InputGroupInput
      v-model="searchQuery"
      placeholder="Search"
      class="text-[15px] placeholder-gray-400"
      @keydown.enter="handleSearch"
    />
  </InputGroup>
</template>
