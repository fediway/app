<script setup lang="ts">
import { PhEnvelope, PhGlobe, PhLock, PhLockOpen } from '@phosphor-icons/vue';

const props = defineProps<{
  modelValue: 'public' | 'unlisted' | 'private' | 'direct';
}>();

const emit = defineEmits<{
  'update:modelValue': [value: 'public' | 'unlisted' | 'private' | 'direct'];
}>();

const options = [
  { value: 'public' as const, label: 'Public', icon: PhGlobe },
  { value: 'unlisted' as const, label: 'Unlisted', icon: PhLockOpen },
  { value: 'private' as const, label: 'Followers', icon: PhLock },
  { value: 'direct' as const, label: 'Direct', icon: PhEnvelope },
];
</script>

<template>
  <div role="radiogroup" aria-label="Post visibility" class="flex flex-wrap gap-2">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="props.modelValue === option.value"
      :aria-label="option.label"
      class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors"
      :class="[
        props.modelValue === option.value
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-accent',
      ]"
      @click="emit('update:modelValue', option.value)"
    >
      <component :is="option.icon" :size="16" />
      <span>{{ option.label }}</span>
    </button>
  </div>
</template>
