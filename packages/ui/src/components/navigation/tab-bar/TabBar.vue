<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { TabItem } from '.';
import { tabItemVariants } from '.';
import { cn } from '../../../lib/utils';
import { Divider } from '../../ui/divider';

interface Props {
  modelValue?: string;
  tabs: TabItem[];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div
    data-slot="tab-bar"
    :class="cn('w-full', props.class)"
  >
    <div class="relative z-10 -mb-px flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        :data-active="modelValue === tab.value"
        :class="cn(tabItemVariants({ active: modelValue === tab.value }))"
        @click="emit('update:modelValue', tab.value)"
      >
        <span class="flex flex-col items-center">
          <span class="flex h-8 items-center">{{ tab.label }}</span>
          <span
            v-if="modelValue === tab.value"
            class="h-[3px] w-full rounded-full bg-primary"
          />
        </span>
      </button>
    </div>
    <Divider />
  </div>
</template>
