<script setup lang="ts">
import { PhStar } from '@phosphor-icons/vue';
import { ref } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: number;
  max?: number;
  disabled?: boolean;
}>(), {
  max: 5,
  disabled: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const hovered = ref(0);

function handleClick(star: number) {
  if (!props.disabled) {
    emit('update:modelValue', star);
  }
}
</script>

<template>
  <div role="radiogroup" :aria-label="`Rating, ${modelValue} out of ${max} stars`" class="inline-flex gap-0.5" :class="{ 'opacity-50 cursor-not-allowed': disabled }">
    <button
      v-for="i in max"
      :key="i"
      type="button"
      :disabled="disabled"
      :aria-label="`Rate ${i} out of ${max} stars`"
      :aria-pressed="modelValue === i"
      class="transition-colors"
      :class="disabled ? 'cursor-not-allowed' : 'cursor-pointer'"
      @mouseenter="hovered = i"
      @mouseleave="hovered = 0"
      @click="handleClick(i)"
    >
      <PhStar
        :size="24"
        :weight="(hovered ? i <= hovered : i <= modelValue) ? 'fill' : 'regular'"
        :class="(hovered ? i <= hovered : i <= modelValue) ? 'text-yellow' : 'text-foreground/20'"
      />
    </button>
  </div>
</template>
