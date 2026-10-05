<script setup lang="ts">
defineProps<{ src: string; strumming: boolean }>();
</script>

<template>
  <span
    class="avatar-guitar"
    :class="{ 'is-strumming': strumming }"
    data-avatar-guitar
    aria-hidden="true"
  >
    <img
      :src="src"
      alt=""
      width="146"
      height="146"
      loading="eager"
      decoding="async"
    />
  </span>
</template>
