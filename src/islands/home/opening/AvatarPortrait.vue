<script setup lang="ts">
defineProps<{ src: string; name: string }>();
</script>

<template>
  <img
    :src="src"
    :alt="`${name} avatar`"
    width="226"
    height="226"
    loading="eager"
    decoding="async"
  />
  <span class="avatar-sparkle" aria-hidden="true">♪</span>
</template>
