<script setup lang="ts">
interface StatItem {
  count: number;
  label: string;
}

interface Props {
  displayName: string;
  handle: string;
  bio?: string | null;
  stats?: StatItem[];
}

withDefaults(defineProps<Props>(), {
  bio: null,
  stats: () => [],
});
</script>

<template>
  <div class="flex flex-col gap-3 px-5">
    <!-- Display Name -->
    <div class="flex flex-col gap-0.5">
      <p class="text-xl font-bold text-foreground leading-normal">
        {{ displayName }}
      </p>
      <p class="text-sm text-muted-foreground">
        {{ handle }}
      </p>
    </div>

    <!-- Bio -->
    <p
      v-if="bio"
      class="font-content text-base text-foreground leading-[22px]"
    >
      {{ bio }}
    </p>

    <!-- Stats -->
    <div
      v-if="stats.length"
      class="flex flex-wrap items-center gap-x-3 gap-y-1.5"
    >
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="flex items-baseline gap-[3px]"
      >
        <span class="text-base font-bold text-foreground">{{ stat.count.toLocaleString() }}</span>
        <span class="text-sm text-muted-foreground">{{ stat.label }}</span>
      </div>
    </div>
  </div>
</template>
