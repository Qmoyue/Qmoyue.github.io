<script setup lang="ts">
defineEmits<{ strum: [] }>();
</script>

<template>
  <button
    class="hero-avatar"
    type="button"
    aria-label="弹一下吉他"
    @click="$emit('strum')"
  >
    <slot />
  </button>
</template>
