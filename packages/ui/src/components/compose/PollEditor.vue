<script setup lang="ts">
import { PhPlus, PhX } from '@phosphor-icons/vue';
import { computed } from 'vue';
import Input from '../ui/input/Input.vue';

const props = defineProps<{
  options: string[];
  duration: number;
  multiple: boolean;
}>();
const emit = defineEmits<{
  'update:options': [options: string[]];
  'update:duration': [duration: number];
  'update:multiple': [multiple: boolean];
}>();
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 4;

const durationOptions = [
  { value: 300, label: '5 minutes' },
  { value: 1800, label: '30 minutes' },
  { value: 3600, label: '1 hour' },
  { value: 21600, label: '6 hours' },
  { value: 86400, label: '1 day' },
  { value: 259200, label: '3 days' },
  { value: 604800, label: '7 days' },
] as const;

function updateOption(index: number, value: string) {
  const updated = [...props.options];
  updated[index] = value;
  emit('update:options', updated);
}

function addOption() {
  if (props.options.length < MAX_OPTIONS) {
    emit('update:options', [...props.options, '']);
  }
}

function removeOption(index: number) {
  if (props.options.length > MIN_OPTIONS) {
    const updated = [...props.options];
    updated.splice(index, 1);
    emit('update:options', updated);
  }
}

const validCount = computed(() => props.options.filter(o => o.trim().length > 0).length);
</script>

<template>
  <div class="rounded-xl border border-border bg-muted p-4">
    <div class="mb-3 flex items-center justify-between">
      <span class="text-sm font-medium text-foreground">Poll</span>
      <slot name="close" />
    </div>

    <!-- Options -->
    <div class="mb-4 space-y-2">
      <div
        v-for="(option, index) in options"
        :key="index"
        class="flex items-center gap-2"
      >
        <div class="flex size-5 shrink-0 items-center justify-center">
          <div
            class="size-4 border-2 border-border"
            :class="[multiple ? 'rounded' : 'rounded-full']"
          />
        </div>
        <Input
          :model-value="option"
          type="text"
          :placeholder="`Option ${index + 1}`"
          maxlength="50"
          class="flex-1 text-sm"
          @update:model-value="updateOption(index, String($event))"
        />
        <button
          v-if="options.length > MIN_OPTIONS"
          type="button"
          class="shrink-0 p-1 text-muted-foreground transition-colors hover:text-red"
          @click="removeOption(index)"
        >
          <PhX :size="16" />
        </button>
        <div v-else class="w-6" />
      </div>
    </div>

    <!-- Add option -->
    <button
      v-if="options.length < MAX_OPTIONS"
      type="button"
      class="mb-4 flex items-center gap-2 text-sm text-foreground transition-colors hover:text-muted-foreground"
      @click="addOption"
    >
      <PhPlus :size="16" />
      <span>Add option</span>
    </button>

    <!-- Settings -->
    <div class="flex flex-wrap items-center gap-4 border-t border-border pt-3">
      <select
        :value="duration"
        class="rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-foreground outline-hidden focus:ring-2 focus:ring-ring"
        @change="emit('update:duration', Number(($event.target as HTMLSelectElement).value))"
      >
        <option
          v-for="opt in durationOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <label class="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          :checked="multiple"
          class="size-4 rounded border-border text-primary focus:ring-ring"
          @change="emit('update:multiple', ($event.target as HTMLInputElement).checked)"
        >
        <span class="text-sm text-muted-foreground">Multiple choices</span>
      </label>
    </div>

    <!-- Validation -->
    <div v-if="validCount < MIN_OPTIONS" class="mt-3 text-xs text-red">
      Add at least {{ MIN_OPTIONS }} options to create a poll
    </div>
  </div>
</template>
