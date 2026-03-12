<script setup lang="ts">
import type { Item, ItemType } from '@repo/types';
import type { Component } from 'vue';
import { PhBook, PhFilmSlate, PhLink, PhMusicNote } from '@phosphor-icons/vue';
import { computed } from 'vue';
import { TagItem } from '@/components/ui/tag-item';

const props = defineProps<{
  item: Item;
}>();

const iconMap: Record<ItemType, Component> = {
  movie: PhFilmSlate,
  song: PhMusicNote,
  book: PhBook,
  link: PhLink,
};

const typeConfig = {
  movie: {
    variant: 'blue' as const,
    label: 'Movie',
    aspect: 'aspect-[48/71]',
    creatorField: 'director' as const,
  },
  song: {
    variant: 'green' as const,
    label: 'Song',
    aspect: 'aspect-square',
    creatorField: 'artist' as const,
  },
  book: {
    variant: 'yellow' as const,
    label: 'Book',
    aspect: 'aspect-[48/71]',
    creatorField: 'author' as const,
  },
  link: {
    variant: 'gray' as const,
    label: 'Link',
    aspect: 'aspect-video',
    creatorField: null,
  },
} as const;

const config = computed(() => typeConfig[props.item.type]);

const creator = computed(() => {
  const field = config.value?.creatorField;
  return field ? props.item[field] : undefined;
});

const label = computed(() => {
  const parts: (string | number)[] = [];
  if (creator.value)
    parts.push(creator.value);
  if (props.item?.year)
    parts.push(props.item.year);
  return parts.join(', ');
});
</script>

<template>
  <div v-if="item" class="inline-flex items-center gap-3">
    <img
      v-if="item.image"
      :src="item.image"
      :alt="item.title"
      class="min-h-12 w-12 shrink-0 rounded-sm border border-[#EDE6D6] bg-[#F6F3EB] object-cover" :class="[config.aspect]"
    >
    <div
      v-else
      class="flex min-h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-[#EDE6D6] bg-[#F6F3EB] text-[#EDE6D6]" :class="[config.aspect]"
    >
      <component :is="iconMap[item.type]" :size="24" />
    </div>
    <div class="min-w-0">
      <p class="line-clamp-2 text-base font-bold text-[#232B37]">
        {{ item.title }}
      </p>
      <div class="flex items-center gap-1.5">
        <TagItem :variant="config.variant">
          <template #icon>
            <component :is="iconMap[item.type]" :size="16" />
          </template>
          {{ config.label }}
        </TagItem>
        <span v-if="label" class="text-sm text-[#232B37]/80">
          {{ label }}
        </span>
      </div>
    </div>
  </div>
</template>
