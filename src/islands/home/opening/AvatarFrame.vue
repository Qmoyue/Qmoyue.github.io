<script setup lang="ts">
defineProps<{ src: string }>();
</script>

<template>
  <img
    class="hero-avatar-frame"
    :src="src"
    alt=""
    width="1254"
    height="1254"
    loading="eager"
    decoding="async"
  />
</template>

<style scoped>
.hero-avatar-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}
</style>
