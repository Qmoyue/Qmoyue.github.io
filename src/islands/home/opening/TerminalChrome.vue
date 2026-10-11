<script setup lang="ts">
defineProps<{ host: string; path: string }>();
</script>

<template>
  <div class="terminal-topbar" aria-hidden="true">
    <span class="terminal-lights"><i></i><i></i><i></i></span>
    <span class="terminal-window-title">{{ host }}:{{ path }}</span>
  </div>
</template>
