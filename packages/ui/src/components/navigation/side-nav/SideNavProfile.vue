<script setup lang="ts">
defineProps<{
  avatar?: string;
  name: string;
  handle: string;
}>();

defineEmits<{ click: [] }>();
</script>

<template>
  <div
    role="button"
    tabindex="0"
    class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted"
    :aria-label="`${name}, ${handle}`"
    @click="$emit('click')"
    @keydown.enter="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <img
      v-if="avatar"
      :src="avatar"
      :alt="name"
      class="size-8 shrink-0 rounded-full"
    >
    <div v-else class="size-8 shrink-0 rounded-full bg-accent" />
    <div class="min-w-0">
      <div class="truncate text-[13px] font-semibold leading-tight text-foreground">
        {{ name }}
      </div>
      <div class="truncate text-xs leading-tight text-muted-foreground">
        {{ handle }}
      </div>
    </div>
  </div>
</template>
