<script setup lang="ts">
import { Status } from '@repo/ui';
import { computed } from 'vue';
import { duneAggregation } from '../mock';

const item = duneAggregation.item;
const maxDistribution = computed(() => Math.max(...duneAggregation.ratingDistribution));
</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-4">
      <router-link to="/demo">
        <button
          type="button"
          class="px-3 py-1.5 border border-gray-300 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      </router-link>
      <h1 class="text-lg font-bold text-gray-900 dark:text-gray-100">
        Item Page
      </h1>
    </header>

    <!-- Item header -->
    <div class="px-4 py-6 flex gap-4">
      <img
        v-if="item.image"
        :src="item.image"
        :alt="item.title"
        class="w-24 h-36 object-cover rounded-lg shrink-0"
      >
      <div class="flex-1 min-w-0">
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">
          {{ item.title }}
        </h2>
        <p v-if="item.author" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ item.author }}
        </p>
        <p v-if="item.year" class="text-sm text-gray-500 dark:text-gray-400">
          {{ item.year }}
        </p>
        <p v-if="item.genre" class="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {{ item.genre }}
        </p>
      </div>
    </div>

    <!-- Average rating -->
    <div class="px-4 pb-4">
      <div class="flex items-baseline gap-2">
        <span class="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {{ duneAggregation.averageRating.toFixed(1) }}
        </span>
        <div class="flex gap-0.5">
          <svg
            v-for="star in 5"
            :key="star"
            class="w-5 h-5"
            :class="star <= Math.round(duneAggregation.averageRating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ duneAggregation.ratingCount }} ratings
        </span>
      </div>
    </div>

    <!-- Rating distribution -->
    <div class="px-4 pb-6">
      <div class="space-y-1.5">
        <div
          v-for="(count, index) in [...duneAggregation.ratingDistribution].reverse()"
          :key="index"
          class="flex items-center gap-2 text-sm"
        >
          <span class="w-4 text-right text-gray-500 dark:text-gray-400">{{ 5 - index }}</span>
          <div class="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-yellow-400 rounded-full"
              :style="{ width: `${maxDistribution > 0 ? (count / maxDistribution) * 100 : 0}%` }"
            />
          </div>
          <span class="w-8 text-right text-xs text-gray-400 dark:text-gray-500">{{ count }}</span>
        </div>
      </div>
    </div>

    <!-- Description -->
    <div v-if="item.description" class="px-4 pb-6">
      <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {{ item.description }}
      </p>
    </div>

    <!-- Friends' takes -->
    <div v-if="duneAggregation.friendsTakes.length" class="border-t border-gray-200 dark:border-gray-700">
      <div class="px-4 py-3">
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Friends' Takes
        </h3>
      </div>
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <Status
          v-for="take in duneAggregation.friendsTakes"
          :key="take.id"
          :status="take"
        />
      </div>
    </div>

    <!-- Recent takes -->
    <div v-if="duneAggregation.recentTakes.length" class="border-t border-gray-200 dark:border-gray-700">
      <div class="px-4 py-3">
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Recent Takes
        </h3>
      </div>
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <Status
          v-for="take in duneAggregation.recentTakes"
          :key="take.id"
          :status="take"
        />
      </div>
    </div>
  </div>
</template>
