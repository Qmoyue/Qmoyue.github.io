<script setup lang="ts">
defineProps<{ src: string }>();
</script>

<template>
  <img
    class="hero-avatar-portrait"
    :src="src"
    alt=""
    width="1676"
    height="1676"
    loading="eager"
    decoding="async"
  />
</template>

<style scoped>
.hero-avatar-portrait {
  position: absolute;
  top: 7.5%;
  left: 8.5%;
  width: 73%;
  height: 73%;
  border-radius: 50%;
  object-fit: cover;
}
</style>
