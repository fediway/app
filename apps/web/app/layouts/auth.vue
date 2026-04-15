<script setup lang="ts">
</script>

<template>
  <div
    class="min-h-dvh overflow-hidden bg-background text-foreground"
    style="background-image:
      radial-gradient(ellipse 80% 60% at 10% 20%, rgba(53, 13, 255, 0.07) 0%, transparent 70%),
      radial-gradient(ellipse 60% 50% at 80% 70%, rgba(59, 72, 92, 0.15) 0%, transparent 70%),
      radial-gradient(ellipse 70% 40% at 50% 40%, rgba(168, 0, 253, 0.04) 0%, transparent 70%);"
  >
    <slot />
  </div>
</template>
