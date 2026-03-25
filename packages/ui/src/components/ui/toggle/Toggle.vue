<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean;
  label?: string;
  description?: string;
  disabled?: boolean;
}>(), {
  label: undefined,
  description: undefined,
  disabled: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

function toggle() {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue);
  }
}
</script>

<template>
  <div class="flex items-center justify-between">
    <div v-if="label || description">
      <span v-if="label" class="text-sm text-foreground">{{ label }}</span>
      <p v-if="description" class="text-xs text-muted-foreground">
        {{ description }}
      </p>
    </div>
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      class="relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :class="[modelValue ? 'bg-primary' : 'bg-border']"
      @click="toggle"
    >
      <span
        class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
        :class="[modelValue ? 'translate-x-5' : 'translate-x-0']"
      />
    </button>
  </div>
</template>
