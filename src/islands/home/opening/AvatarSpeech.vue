<script setup lang="ts">
defineProps<{ text: string; speaking: boolean }>();
</script>

<template>
  <span
    class="avatar-speech"
    :class="{ 'is-speaking': speaking }"
    data-avatar-speech
    aria-hidden="true"
    >{{ text }}</span
  >
</template>
