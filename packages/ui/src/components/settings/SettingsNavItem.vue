<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  to?: string;
  href?: string;
  badge?: number | string;
  external?: boolean;
  destructive?: boolean;
}>();

defineEmits<{
  click: [];
}>();

const tag = computed(() => {
  if (props.to)
    return 'router-link';
  if (props.href)
    return 'a';
  return 'button';
});

const linkProps = computed(() => {
  if (props.to)
    return { to: props.to };
  if (props.href)
    return { href: props.href, target: '_blank', rel: 'noopener noreferrer' };
  return { type: 'button' };
});
</script>

<template>
  <component
    :is="tag"
    v-bind="linkProps"
    class="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-muted"
    @click="$emit('click')"
  >
    <span
      class="text-sm"
      :class="destructive ? 'text-red' : 'text-foreground'"
    >
      {{ label }}
    </span>
    <span class="flex items-center gap-2">
      <span
        v-if="badge"
        class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
      >
        {{ badge }}
      </span>
      <span class="text-sm text-muted-foreground">
        {{ external ? '↗' : '›' }}
      </span>
    </span>
  </component>
</template>
