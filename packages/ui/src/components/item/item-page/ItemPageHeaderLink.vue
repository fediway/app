<script setup lang="ts">
import type { Item } from '@repo/types';
import { PhLink } from '@phosphor-icons/vue';
import { computed } from 'vue';
import { vFadeOnLoad } from '../../../directives/fadeOnLoad';
import { TagItem } from '../../ui/tag-item';
import ItemPageActions from './ItemPageActions.vue';

interface Props {
  item: Item;
}

const props = defineProps<Props>();

defineEmits<{
  visit: [];
  share: [];
  back: [];
}>();

const domain = computed(() => {
  try {
    return new URL(props.item.url).hostname.replace('www.', '');
  }
  catch {
    return 'Link';
  }
});
</script>

<template>
  <div class="flex flex-col">
    <!-- Hero image -->
    <div class="px-4 pt-4">
      <div v-if="item.image" class="h-40 w-full overflow-hidden rounded-lg border border-border bg-muted">
        <img
          v-fade-on-load
          :src="item.image"
          :alt="item.title"
          class="size-full object-cover"
          loading="eager"
          decoding="async"
        >
      </div>
      <div
        v-else
        class="flex h-40 w-full items-center justify-center rounded-lg bg-muted"
        style="background-image: linear-gradient(138deg, rgba(53, 13, 255, 0.056) 15%, rgba(168, 0, 253, 0.07) 35%, rgba(191, 128, 255, 0.063) 69%, rgba(255, 255, 255, 0.07) 92%);"
      >
        <PhLink :size="32" class="text-muted-foreground/50" />
      </div>
    </div>

    <!-- Badge + domain -->
    <div class="flex items-center gap-2 px-4 mt-3">
      <TagItem variant="gray">
        <template #icon>
          <PhLink :size="14" />
        </template>
        Article
      </TagItem>
      <span class="text-sm font-medium text-galaxy-500 dark:text-galaxy-400">
        {{ domain }}
      </span>
    </div>

    <!-- Title -->
    <h1 class="px-4 mt-2 text-xl font-bold leading-tight text-foreground">
      {{ item.title }}
    </h1>

    <!-- Description -->
    <p v-if="item.description" class="px-4 mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-3">
      {{ item.description }}
    </p>

    <!-- Author if available -->
    <p v-if="item.author" class="px-4 mt-1 text-sm text-muted-foreground">
      by {{ item.author }}
    </p>

    <!-- Actions -->
    <div class="px-4 mt-4 pb-4 border-b border-border">
      <ItemPageActions @visit="$emit('visit')" @share="$emit('share')" />
    </div>
  </div>
</template>
